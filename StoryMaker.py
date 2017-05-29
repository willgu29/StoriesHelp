# Import everything needed to edit video clips
from moviepy.editor import *



def createMovie(id, urls, sentences):
    clip1 = VideoFileClip("https://media.giphy.com/media/aLdiZJmmx4OVW/giphy.mp4")
    clip1 = clip1.volumex(0.0)
    clip2 = VideoFileClip("https://media.giphy.com/media/13axhuqbzavew0/giphy.mp4")
    clip2 = clip2.volumex(0.0)

    final_clip = concatenate_videoclips([clip1,clip2])
    # Overlay the text clip on the first video clip
    video = CompositeVideoClip([final_clip.set_pos('center')], size=(600,600))


    writePath = './static/uploads/'  + id  + '.mp4'
    # Write the result to a file (many options available !)
    video.write_videofile(writePath, fps=30)
