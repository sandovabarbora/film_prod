# Generated by Django 5.2.4 on 2025-07-07 15:48

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('analytics', '0001_initial'),
        ('crew', '0001_initial'),
        ('production', '0001_initial'),
        ('schedule', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='budgettracking',
            name='production',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='budget_tracking', to='production.production'),
        ),
        migrations.AddField(
            model_name='crewperformance',
            name='crew_member',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='performances', to='crew.crewmember'),
        ),
        migrations.AddField(
            model_name='crewperformance',
            name='production',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='crew_performances', to='production.production'),
        ),
        migrations.AddField(
            model_name='productionmetrics',
            name='production',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='metrics', to='production.production'),
        ),
        migrations.AddField(
            model_name='productionmetrics',
            name='shooting_day',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='metrics', to='schedule.shootingday'),
        ),
        migrations.AddField(
            model_name='progressreport',
            name='generated_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='progressreport',
            name='production',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='progress_reports', to='production.production'),
        ),
        migrations.AddField(
            model_name='velocitytrend',
            name='production',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='velocity_trends', to='production.production'),
        ),
        migrations.AlterUniqueTogether(
            name='budgettracking',
            unique_together={('production', 'date')},
        ),
        migrations.AlterUniqueTogether(
            name='crewperformance',
            unique_together={('production', 'crew_member', 'date')},
        ),
        migrations.AlterUniqueTogether(
            name='productionmetrics',
            unique_together={('production', 'date')},
        ),
        migrations.AlterUniqueTogether(
            name='progressreport',
            unique_together={('production', 'report_type', 'period_start', 'period_end')},
        ),
        migrations.AlterUniqueTogether(
            name='velocitytrend',
            unique_together={('production', 'week_ending')},
        ),
    ]
