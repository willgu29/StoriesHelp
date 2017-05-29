# Import everything needed to edit video clips
from moviepy.editor import *



def createMovie(id, urls, sentences):

    clips = []
    for url in urls:
        newClip = VideoFileClip(url)
        newClip = newClip.volumex(0)
        newClip = newClip.set_duration(3)
        clips.append(newClip)



    final_clip = concatenate_videoclips(clips)
    # Overlay the text clip on the first video clip
    video = CompositeVideoClip([final_clip.set_pos('center')], size=(600,600))


    writePath = './static/uploads/'  + str(id)  + '.mp4'
    # Write the result to a file (many options available !)
    video.write_videofile(writePath, fps=30)

def getSentenceSeconds(sentence):
    characters = len(sentence)
    averageWordsByChar = characters/4.5;
    base = averageWordsByChar/2.2;
    seconds = base;
    if base < 1:
        seconds = (seconds + 1.5);
    if base < 2:
        seconds = (seconds + 0.5);
    if seconds > 4.5:
        seconds =  4.5

    return (seconds + 0.2)
