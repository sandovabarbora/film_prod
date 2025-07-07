# apps/notifications/services.py
from django.core.mail import send_mail, send_mass_mail
from django.conf import settings
from django.utils import timezone
from django.template.loader import render_to_string
from django.db import transaction
import logging
import requests
from typing import List, Dict, Any
from datetime import datetime
import json

from .models import (
    Notification, NotificationLog, BulkNotification,
    SMSProvider, PushProvider, NotificationPreference
)
from apps.crew.models import CrewAssignment

logger = logging.getLogger(__name__)

class NotificationService:
    """Central service for sending notifications"""
    
    def send_notification(self, notification: Notification) -> Dict[str, Any]:
        """Send a single notification through all configured channels"""
        results = {
            'success': False,
            'channels': {}
        }
        
        # Check recipient preferences
        preferences = self._get_recipient_preferences(notification)
        
        # Mark as sending
        notification.status = 'sending'
        notification.save()
        
        # Send through each channel
        for channel in notification.channels:
            if self._should_send_channel(channel, preferences):
                try:
                    if channel == 'email':
                        result = self._send_email(notification)
                    elif channel == 'sms':
                        result = self._send_sms(notification)
                    elif channel == 'push':
                        result = self._send_push(notification)
                    elif channel == 'in_app':
                        result = {'success': True}  # Already in database
                    else:
                        result = {'success': False, 'error': 'Unknown channel'}
                    
                    results['channels'][channel] = result
                    
                    # Log result
                    NotificationLog.objects.create(
                        notification=notification,
                        event='sent' if result['success'] else 'failed',
                        channel=channel,
                        details=result,
                        error_message=result.get('error', '')
                    )
                    
                except Exception as e:
                    logger.error(f"Error sending {channel} notification: {e}")
                    results['channels'][channel] = {
                        'success': False,
                        'error': str(e)
                    }
        
        # Update notification status
        if any(r.get('success') for r in results['channels'].values()):
            notification.status = 'sent'
            notification.sent_at = timezone.now()
            results['success'] = True
        else:
            notification.status = 'failed'
            notification.last_error = json.dumps(results['channels'])
        
        notification.channel_status = results['channels']
        notification.save()
        
        return results
    
    def send_bulk_notification(self, bulk_notification: BulkNotification):
        """Send bulk notification to multiple recipients"""
        # Get recipients
        recipients = self._get_bulk_recipients(bulk_notification)
        
        # Update count
        bulk_notification.recipient_count = len(recipients)
        bulk_notification.save()
        
        sent_count = 0
        failed_count = 0
        
        # Create individual notifications
        with transaction.atomic():
            for recipient in recipients:
                try:
                    notification = Notification.objects.create(
                        recipient_crew=recipient.crew_member,
                        subject=bulk_notification.subject,
                        body=bulk_notification.body,
                        notification_type='general',
                        priority='normal',
                        production=bulk_notification.production,
                        channels=['email', 'in_app'],
                        status='scheduled'
                    )
                    
                    # Send immediately if configured
                    if bulk_notification.send_immediately:
                        result = self.send_notification(notification)
                        if result['success']:
                            sent_count += 1
                        else:
                            failed_count += 1
                    else:
                        # Schedule for later
                        notification.scheduled_for = bulk_notification.scheduled_for
                        notification.save()
                
                except Exception as e:
                    logger.error(f"Error creating notification: {e}")
                    failed_count += 1
        
        # Update bulk notification
        bulk_notification.sent_count = sent_count
        bulk_notification.failed_count = failed_count
        bulk_notification.status = 'sent'
        bulk_notification.sent_at = timezone.now()
        bulk_notification.save()
    
    def _send_email(self, notification: Notification) -> Dict[str, Any]:
        """Send email notification"""
        try:
            recipient_email = self._get_recipient_email(notification)
            if not recipient_email:
                return {'success': False, 'error': 'No email address'}
            
            # Render email template
            context = {
                'notification': notification,
                'recipient_name': notification.get_recipient_name(),
                'action_url': notification.action_url,
                'unsubscribe_token': self._generate_unsubscribe_token(notification)
            }
            
            html_content = render_to_string(
                'notifications/email_notification.html',
                context
            )
            
            # Send email
            send_mail(
                subject=notification.subject,
                message=notification.body,  # Plain text fallback
                html_message=html_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=False
            )
            
            return {'success': True}
        
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _send_sms(self, notification: Notification) -> Dict[str, Any]:
        """Send SMS notification"""
        try:
            # Get default SMS provider
            provider = SMSProvider.objects.filter(
                is_active=True,
                is_default=True
            ).first()
            
            if not provider:
                return {'success': False, 'error': 'No SMS provider configured'}
            
            recipient_phone = self._get_recipient_phone(notification)
            if not recipient_phone:
                return {'success': False, 'error': 'No phone number'}
            
            # Send based on provider type
            if provider.provider_type == 'twilio':
                return self._send_twilio_sms(provider, recipient_phone, notification)
            else:
                return {'success': False, 'error': f'Unsupported provider: {provider.provider_type}'}
        
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _send_twilio_sms(self, provider: SMSProvider, phone: str, notification: Notification) -> Dict[str, Any]:
        """Send SMS via Twilio"""
        try:
            from twilio.rest import Client
            
            client = Client(provider.api_key, provider.api_secret)
            
            # Truncate message for SMS
            message = notification.subject
            if len(message) > 160:
                message = message[:157] + '...'
            
            result = client.messages.create(
                body=message,
                from_=provider.from_number,
                to=phone
            )
            
            return {
                'success': True,
                'sid': result.sid,
                'status': result.status
            }
        
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _send_push(self, notification: Notification) -> Dict[str, Any]:
        """Send push notification"""
        try:
            # Get default push provider
            provider = PushProvider.objects.filter(
                is_active=True,
                is_default=True
            ).first()
            
            if not provider:
                return {'success': False, 'error': 'No push provider configured'}
            
            # Get device tokens
            device_tokens = self._get_device_tokens(notification)
            if not device_tokens:
                return {'success': False, 'error': 'No device tokens'}
            
            # Send based on provider type
            if provider.provider_type == 'fcm':
                return self._send_fcm_push(provider, device_tokens, notification)
            else:
                return {'success': False, 'error': f'Unsupported provider: {provider.provider_type}'}
        
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _send_fcm_push(self, provider: PushProvider, tokens: List[str], notification: Notification) -> Dict[str, Any]:
        """Send push via Firebase Cloud Messaging"""
        try:
            # FCM implementation would go here
            # This is a placeholder
            return {
                'success': True,
                'sent_to': len(tokens),
                'provider': 'fcm'
            }
        
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _get_recipient_preferences(self, notification: Notification) -> NotificationPreference:
        """Get recipient's notification preferences"""
        if notification.recipient_user:
            prefs, _ = NotificationPreference.objects.get_or_create(
                user=notification.recipient_user
            )
            return prefs
        return None
    
    def _should_send_channel(self, channel: str, preferences: NotificationPreference) -> bool:
        """Check if channel should be used based on preferences"""
        if not preferences:
            return True
        
        # Check channel preferences
        if channel == 'email' and not preferences.email_enabled:
            return False
        if channel == 'sms' and not preferences.sms_enabled:
            return False
        if channel == 'push' and not preferences.push_enabled:
            return False
        if channel == 'in_app' and not preferences.in_app_enabled:
            return False
        
        # Check notification type preferences
        type_map = {
            'call_sheet': preferences.call_sheets,
            'schedule_change': preferences.schedule_changes,
            'day_wrap': preferences.day_wraps,
            'weather_alert': preferences.weather_alerts,
            'safety_alert': preferences.safety_alerts,
            'general': preferences.general_updates,
            'reminder': preferences.reminders
        }
        
        # Check quiet hours
        if preferences.quiet_hours_start and preferences.quiet_hours_end:
            current_time = timezone.now().time()
            if preferences.quiet_hours_start <= current_time <= preferences.quiet_hours_end:
                # Only allow urgent notifications during quiet hours
                if channel in ['sms', 'push'] and notification.priority != 'urgent':
                    return False
        
        return True
    
    def _get_recipient_email(self, notification: Notification) -> str:
        """Get recipient's email address"""
        if notification.recipient_user:
            return notification.recipient_user.email
        elif notification.recipient_crew:
            return notification.recipient_crew.email
        return notification.recipient_email
    
    def _get_recipient_phone(self, notification: Notification) -> str:
        """Get recipient's phone number"""
        if notification.recipient_crew:
            return notification.recipient_crew.phone_primary
        return None
    
    def _get_device_tokens(self, notification: Notification) -> List[str]:
        """Get recipient's device tokens for push notifications"""
        # This would retrieve tokens from a UserDevice model
        # Placeholder for now
        return []
    
    def _get_bulk_recipients(self, bulk_notification: BulkNotification) -> List[CrewAssignment]:
        """Get recipients for bulk notification"""
        recipients = CrewAssignment.objects.filter(
            production=bulk_notification.production,
            status='confirmed'
        ).select_related('crew_member', 'position__department')
        
        # Apply filters
        if bulk_notification.recipient_type == 'department':
            department_ids = bulk_notification.recipient_filters.get('department_ids', [])
            recipients = recipients.filter(position__department_id__in=department_ids)
        
        elif bulk_notification.recipient_type == 'position':
            position_ids = bulk_notification.recipient_filters.get('position_ids', [])
            recipients = recipients.filter(position_id__in=position_ids)
        
        elif bulk_notification.recipient_type == 'custom':
            crew_ids = bulk_notification.recipient_filters.get('crew_ids', [])
            recipients = recipients.filter(crew_member_id__in=crew_ids)
        
        return list(recipients)
    
    def _generate_unsubscribe_token(self, notification: Notification) -> str:
        """Generate unsubscribe token"""
        # Simple implementation - use proper encryption in production
        import hashlib
        data = f"{notification.id}:{notification.created_at}"
        return hashlib.sha256(data.encode()).hexdigest()[:20]
    
    def test_sms_provider(self, provider: SMSProvider) -> Dict[str, Any]:
        """Test SMS provider connection"""
        try:
            if provider.provider_type == 'twilio':
                from twilio.rest import Client
                client = Client(provider.api_key, provider.api_secret)
                # Try to fetch account info
                account = client.api.accounts(provider.api_key).fetch()
                return {
                    'success': True,
                    'status': account.status,
                    'message': 'Connection successful'
                }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Connection failed'
            }
    
    def test_push_provider(self, provider: PushProvider) -> Dict[str, Any]:
        """Test push provider connection"""
        # Implementation depends on provider
        return {
            'success': True,
            'message': 'Test not implemented'
        }
    
    def send_scheduled_notifications(self):
        """Send all scheduled notifications (called by cron/celery)"""
        notifications = Notification.objects.filter(
            status='scheduled',
            scheduled_for__lte=timezone.now()
        )
        
        for notification in notifications:
            self.send_notification(notification)
    
    def send_daily_digests(self):
        """Send daily digest emails"""
        # Get users with daily digest enabled
        preferences = NotificationPreference.objects.filter(
            daily_digest=True
        ).select_related('user')
        
        for pref in preferences:
            # Check if it's time to send based on timezone
            # Collect today's notifications
            # Send digest email
            pass