from django.shortcuts import render
from django.http import HttpResponse
import pandas as pd
from django.core import serializers
from datetime import datetime, timedelta
import data_utils.data as data
from .models import WholeDayData

def home(req):
    return render(req, 'meteograms/home.html')
    #return HttpResponse(data.getHTML())

def bootstrap(req):
    if 'date' in req.GET:
        start = req.GET.get('date').split("-")[0]
        end = req.GET.get('date').split("-")[1]

        try: #maybe check if it has not occured yet ? or put that in the datePicker?
            startSplit = start.split("/")
            endSplit = end.split("/")
            startDT = datetime(year=int(startSplit[2]), month=int(startSplit[0]),day=int(startSplit[1]))
            endDT = datetime(year=int(endSplit[2]), month=int(endSplit[0]),day=int(endSplit[1]))
        except ValueError:
            return ""

        daysToReq = []
        if startDT == endDT:
            daysToReq = [str(datetime.strptime(start, '%m/%d/%Y').strftime('%-m/%-d/%Y'))]
        else:
            daysToReq = pd.date_range(startDT,endDT-timedelta(),freq='d').strftime('%-m/%-d/%Y')  

        daysList = [serializers.serialize("json", WholeDayData.objects.all().filter(date=day)) for day in daysToReq]
        lists = [day for day in daysList if day!='[]']

        context = { 
                    'lists' : lists
                  }

        return render(req, 'meteograms/extension.html', context)  
    else:
        return render(req, 'meteograms/extension.html')