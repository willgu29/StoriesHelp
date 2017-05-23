import sys
import json
from aeneas.executetask import ExecuteTask
from aeneas.task import Task



def createTextFileFromJSON():
    sentences = []
    storyID = ""
    ##re-add fileName when done test
    with open("./story.json") as json_data:
        story = json.load(json_data)
        sentences = story["sentences"]
        storyID = story['_id']["$oid"]

    thefile = open("story.txt", 'w')
    i = 0
    for sentence in sentences:
        i = i + 1
        thefile.write("f%d|%s \n" %(i, sentence))

    thefile.close()
    print("DONE *** ID: ", storyID, " printed ", i, " sentences.")


# create Task object
config_string = u"task_language=eng|is_text_type=parsed|os_task_file_format=json"
task = Task(config_string=config_string)
task.audio_file_path_absolute = u"./audio.mp3"
task.text_file_path_absolute = u"./story.txt"
task.sync_map_file_path_absolute = u"./timings.json"

# process Task
ExecuteTask(task).execute()

# output sync map to file
task.output_sync_map_file()
