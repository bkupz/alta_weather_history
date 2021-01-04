# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class DailyData(models.Model):
    date = models.TextField(blank=True, null=True)
    snowfall = models.FloatField(blank=True, null=True)
    period_of_heavy_snowfall = models.IntegerField(blank=True, null=True)
    wet_snow = models.IntegerField(blank=True, null=True)
    heavy_wind_8550 = models.IntegerField(blank=True, null=True)
    heavy_wind_10500 = models.IntegerField(blank=True, null=True)
    heavy_wind_11068 = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'daily_data'


class WholeDayData(models.Model):
    date = models.TextField(blank=True, null=True)
    time = models.TextField(blank=True, null=True)
    h2o_9664_1hr = models.FloatField(blank=True, null=True)
    snow_9664_12hr = models.FloatField(blank=True, null=True)
    temp_f_8550_avg = models.IntegerField(db_column='temp_f°_8550_avg', blank=True, null=True)  # Field renamed to remove unsuitable characters.
    temp_f_10500_avg = models.IntegerField(db_column='temp_f°_10500_avg', blank=True, null=True)  # Field renamed to remove unsuitable characters.
    temp_f_11068_avg = models.IntegerField(db_column='temp_f°_11068_avg', blank=True, null=True)  # Field renamed to remove unsuitable characters.
    rh_8550_avg = models.IntegerField(blank=True, null=True)
    rh_10500_avg = models.IntegerField(blank=True, null=True)
    rh_11068_avg = models.IntegerField(blank=True, null=True)
    w_spd_8550_avg = models.IntegerField(blank=True, null=True)
    w_dir_8550_avg = models.IntegerField(blank=True, null=True)
    w_gust_8550_max = models.IntegerField(blank=True, null=True)
    w_spd_10500_avg = models.IntegerField(blank=True, null=True)
    w_dir_10500_avg = models.IntegerField(blank=True, null=True)
    w_gust_10500_max = models.IntegerField(blank=True, null=True)
    w_spd_11068_avg = models.IntegerField(blank=True, null=True)
    w_dir_11068_avg = models.IntegerField(blank=True, null=True)
    w_gust_11068_max = models.IntegerField(blank=True, null=True)
    h2o_8550_1hr = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'whole_day_data'
