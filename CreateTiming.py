import sys
import json
from aeneas.exacttiming import TimeValue
from aeneas.executetask import ExecuteTask
from aeneas.language import Language
from aeneas.syncmap import SyncMapFormat
from aeneas.task import Task
from aeneas.task import TaskConfiguration
from aeneas.textfile import TextFragment
from aeneas.textfile import TextFile
from aeneas.textfile import TextFileFormat
import aeneas.globalconstants as gc

def createFragment(id, text, begin, end):
    fragment = {
        'id' : str(id),
        'begin' : float(begin),
        'end' : float(end),
        'text' : str(text)
    }
    return fragment

def alignTextToAudio(story, audioPath):

    sentences = story.sentences
    task = Task()
    textfile = TextFile()

    for idx, sentence in enumerate(sentences):
        f = (u'f' + str(idx))
        fragment = TextFragment(f, Language.ENG, [sentence], [sentence])
        textfile.add_fragment(fragment)

    task.text_file = textfile


    config = TaskConfiguration()
    config[gc.PPN_TASK_LANGUAGE] = Language.ENG
    config[gc.PPN_TASK_IS_TEXT_FILE_FORMAT] = TextFileFormat.PARSED
    config[gc.PPN_TASK_OS_FILE_FORMAT] = SyncMapFormat.JSON

    task.configuration = config
    task.audio_file_path_absolute = audioPath
    # process Task
    ExecuteTask(task).execute()

    fragments = []
    for fragment in task.sync_map_leaves():
        id = fragment.text_fragment.identifier
        if (id == 'HEAD' or id == 'TAIL'):
            continue
        newFragment = createFragment(   id,
                                        fragment.text_fragment.text,
                                        fragment.begin,
                                        fragment.end)
        fragments.append(newFragment)
    return fragments