#Import everything needed to edit video clips
import imageio
imageio.plugins.ffmpeg.download()

from moviepy.editor import *
from moviepy.video.fx.all import loop
from moviepy.video.fx.all import crop
from moviepy.video.fx.all import margin
from moviepy.audio.AudioClip import AudioClip
import CreateTiming


def createVideoClip(url, start, out):
    newClip = VideoFileClip(url)
    newClip = newClip.resize(height=360)
    newClip = newClip.crop(x2=640)
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
                            size=(620, 80))

    newTextClip = newTextClip.set_duration(out)
    newTextClip = newTextClip.set_start(start)
    newTextClip = newTextClip.margin(bottom=5, opacity=0)

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


def credits():
    penguin = VideoFileClip('../CreatedStories/Credits/penguin.mp4')
    penguin = clipToDuration(penguin, 2)
    paper = ImageClip('../CreatedStories/Credits/paper.jpg', duration=2)
    madeBy = createTextClip('Made by Penguin Jeffrey', 'Helvetica', 'black', 0, 2)
    credits = CompositeVideoClip([paper.set_pos('center'), penguin.set_pos(('center', 60)), madeBy.set_pos(('center', 300))], size=(640, 480))

    return credits

def createMovieWithAudio(id, urls, sentences, fragments, audioPath):
    clips = []
    for idx, url in enumerate(urls):
        print ("Creating clip: " + str(idx))
        fragment = fragments[idx]
        seconds = fragment['end'] - fragment['begin']
        sentence = sentences[idx]
        newVideo = createVideoClip(url, 0, seconds)
        newText = createTextClip(sentence, "Helvetica", 'white', 0, seconds)
        video = CompositeVideoClip([newVideo.set_pos('center'), newText.set_pos((('center'), ('bottom')))],
                                        size=(640, 480))
        clips.append(video)

    print("Concatenating")
    clips.append(credits())

    final_clip = concatenate_videoclips(clips)

    #audio = AudioFileClip(audioPath)
    #video.set_audio(audio.set_duration(final))

    writePath = '../CreatedStories/New/'  + str(id)  + '.mp4'
    # Write the result to a file (many  options available !)
    final_clip.write_videofile(          writePath,
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
        newVideo = createVideoClip(url, 0, seconds)
        newText = createTextClip(sentence, "Helvetica", 'white', 0, seconds)
        video = CompositeVideoClip([newVideo.set_pos('center'), newText.set_pos((('center'), ('bottom')))],
                                    size=(640, 480))
        clips.append(video)

    clips.append(credits())
    print("Concatenating")
    final_clip = concatenate_videoclips(clips)
    print("Final video clip")

    writePath = '../CreatedStories/New/'  + str(id)  + '.mp4'
    # Write the result to a file (many  options available !)
    final_clip.write_videofile(writePath, fps=30, preset='veryfast',progress_bar=True,verbose=True)
