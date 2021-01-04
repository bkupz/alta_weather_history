from apscheduler.schedulers.blocking import BlockingScheduler
import data_utils.data as data

sched = BlockingScheduler()


def timed_job():
    data.addHourDataToDB()

sched.add_job(timed_job, 'cron', minute=5)
sched.start()