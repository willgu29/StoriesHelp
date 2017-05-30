# Import everything needed to edit video clips
from moviepy.editor import *
from moviepy.video.fx.all import loop
from moviepy.audio.AudioClip import AudioClip
import CreateTiming


def createVideoClip(url, start, out):
    newClip = VideoFileClip(url)
    newClip = newClip.resize(width=600)
    newClip = newClip.volumex(0)
    newClip = clipToDuration(newClip, (out-start))
    newClip = newClip.set_start(start)
    return newClip


def clipToDuration(clip, targetSeconds):
    clip = (clip.fx(vfx.loop, duration=targetSeconds))
    clip = clip.set_duration(targetSeconds)
    return clip

def createTextClip(text, font, color, start, out):
    newTextClip = TextClip(txt=text,
                            font=font,
                            fontsize=30,
                            color=color,
                            method="caption",
                            align='South',
                            size=(600, 590))

    newTextClip = newTextClip.set_duration(out)
    #newTextClip = newTextClip.set_start(start )

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

def createMovieWithAudio(id, urls, sentences, fragments, audioPath):
    clips = []
    for idx, url in enumerate(urls):
        print ("Creating clip: " + str(idx))
        fragment = fragments[idx]
        seconds = fragment['end'] - fragment['begin']
        sentence = sentences[idx]
        newVideo = createVideoClip(url, 0, seconds)
        clips.append(newVideo)


    print("Concatenating")
    final_clip = concatenate_videoclips(clips)
    #audio = AudioFileClip(audioPath)
    print("Final video clip")
    video = CompositeVideoClip([final_clip.set_pos('center')], size=(600, 600))
    #video.set_audio(audio.set_duration(final))

    writePath = './static/uploads/'  + str(id)  + '.mp4'
    # Write the result to a file (many  options available !)
    video.write_videofile(          writePath,
                                    fps=30,
                                    preset='veryfast',
                                    progress_bar=True,
                                    verbose=True,
                                    audio=audioPath)

def createMovieWithText(id, urls, sentences):

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
