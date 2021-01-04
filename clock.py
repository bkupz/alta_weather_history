from apscheduler.schedulers.blocking import BlockingScheduler
from datetime import datetime
import data_utils.data as data

sched = BlockingScheduler()


def timed_job():
    now = datetime.now()

    current_time = now.strftime("%H:%M:%S")
    print("Adding to db")
    print("Current Time =", current_time)
    data.addHourDataToDB()
    print("done updating db")
    current_time = now.strftime("%H:%M:%S")
    print("Current Time =", current_time)

sched.add_job(timed_job, 'cron', minute=10)
sched.start()