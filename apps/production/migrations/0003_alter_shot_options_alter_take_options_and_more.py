# Generated by Django 5.2.4 on 2025-07-09 11:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('production', '0002_add_location_primary'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='shot',
            options={'ordering': ['scene', 'shot_number']},
        ),
        migrations.AlterModelOptions(
            name='take',
            options={'ordering': ['shot', 'take_number']},
        ),
        migrations.RenameField(
            model_name='shot',
            old_name='estimated_time',
            new_name='estimated_duration',
        ),
        migrations.RemoveField(
            model_name='shot',
            name='actual_time',
        ),
        migrations.RemoveField(
            model_name='shot',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='shot',
            name='lens',
        ),
        migrations.RemoveField(
            model_name='take',
            name='timecode_in',
        ),
        migrations.RemoveField(
            model_name='take',
            name='timecode_out',
        ),
        migrations.AddField(
            model_name='shot',
            name='actual_duration',
            field=models.DurationField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='shot',
            name='lighting_notes',
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name='shot',
            name='description',
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name='shot',
            name='shot_type',
            field=models.CharField(choices=[('WS', 'Wide Shot'), ('MS', 'Medium Shot'), ('CU', 'Close Up'), ('ECU', 'Extreme Close Up'), ('OTS', 'Over The Shoulder'), ('POV', 'Point of View'), ('INSERT', 'Insert'), ('MASTER', 'Master Shot'), ('TWO_SHOT', 'Two Shot'), ('TRACKING', 'Tracking Shot'), ('CRANE', 'Crane Shot'), ('DRONE', 'Drone Shot')], default='MS', max_length=10),
        ),
        migrations.AlterField(
            model_name='shot',
            name='status',
            field=models.CharField(choices=[('not_shot', 'Not Shot'), ('setup', 'Setting Up'), ('rehearsal', 'Rehearsing'), ('rolling', 'Rolling'), ('completed', 'Completed')], default='not_shot', max_length=15),
        ),
        migrations.AlterField(
            model_name='shot',
            name='takes_planned',
            field=models.IntegerField(default=3),
        ),
        migrations.AlterField(
            model_name='take',
            name='result',
            field=models.CharField(choices=[('good', 'Good'), ('print', 'Print'), ('ng', 'No Good'), ('hold', 'Hold'), ('safety', 'Safety')], default='ng', max_length=10),
        ),
    ]
