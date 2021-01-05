from apscheduler.schedulers.blocking import BlockingScheduler
from datetime import datetime
import data_utils.data as data

sched = BlockingScheduler()


def timed_job():
    now = datetime.now()

    current_time = now.strftime("%H" + ":00")
    day = now.strftime('%-m/%-d/%Y')
    if(data.checkIfDatetimeExists(day, current_time)):
        print("data exists, skipping updating")
    else:
        print("updating db")
        print("Current Time =", current_time) 
        data.addHourDataToDB()
        print("done updating db")
        current_time = now.strftime("%H" + ":00")
        print("Current Time =", current_time)

sched.add_job(timed_job, 'interval', minutes=15)
sched.start()