from apscheduler.schedulers.blocking import BlockingScheduler
import data_utils.data as data

sched = BlockingScheduler()

@sched.scheduled_job('interval', hours=1)
def timed_job():
    data.addHourDataToDB()

sched.start()