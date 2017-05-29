# Import everything needed to edit video clips
from moviepy.editor import *






def createVideoClip(url, volume, start, out):
    newClip = VideoFileClip(url)
    newClip = newClip.volumex(volume)
    newClip = newClip.set_duration(out)
    #newClip = newClip.set_start(start)
    return newClip

def createTextClip(text, font, color, start, out):
    newTextClip = TextClip(txt=text,
                            font=font,
                            fontsize=30,
                            color=color,
                            method="caption",
                            align='South',
                            size=(600, 590))

    newTextClip = newTextClip.set_duration(out)
    #newTextClip = newTextClip.set_start(start)

    return newTextClip

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


def createMovie(id, urls, sentences):

    clips = []
    for idx, url in enumerate(urls):
        print ("Creating clip: " + str(idx))
        seconds = getSentenceSeconds(sentences[idx])
        sentence = sentences[idx]
        newVideo = createVideoClip(url, 0, 0, seconds)
        newText = createTextClip(sentence, "Helvetica", 'white', 0, seconds)
        video = CompositeVideoClip([newVideo.set_pos('center'), newText], size=(600, 600))
        clips.append(video)


    print("Concatenating")
    final_clip = concatenate_videoclips(clips)
    print("Final video clip")

    writePath = './static/uploads/'  + str(id)  + '.mp4'
    # Write the result to a file (many  options available !)
    final_clip.write_videofile(writePath, fps=30, preset='veryfast',progress_bar=True,verbose=True)
