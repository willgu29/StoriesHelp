from flask import (Flask, render_template, request, jsonify, make_response,
send_from_directory, redirect, url_for, current_app, flash)
from flask_uploads import UploadSet, AUDIO, configure_uploads

app = Flask(__name__)
app.config.from_pyfile('flask.cfg')
app.secret_key = "this1salt1112ndksj"

from ast import literal_eval
import HTMLParser
import json
import os
import urllib
import sentenceToText
import pixabayAPI
import convertToStory
import CreateTiming
import StringConversion
import StoryMaker

logo_gif_url = "https://media.giphy.com/media/VkMV9TldsPd28/giphy.gif"


#DATABASE_MONGODB
from mongoengine import *
from mongoengine import connect
from datetime import *
connect("extendV0", host='mongodb://penguinjeffrey:ilikefish12@ds113282.mlab.com:13282/penguinjeffrey')

class Story(Document):
    title = StringField(required=True, default="")
    sentences = ListField(StringField(), required=True, default=list)

    #not necessarily .gif, may include .mp4 as well
    gifURLS = ListField(URLField(), required=True, default=list)
    videoURL = StringField(default="")
    isPublic = BooleanField(default=True)
    views = IntField(default=0)
    created = DateTimeField(default=datetime.now())
    isDraft = BooleanField(default=True)
    tag = StringField(default="")
    externalURL = StringField(default="")
    #current tags: PURPOSE, JOURNEY (process), RELATIONSHIPS, SELF (anxiety/fear),

class Timings(Document):
    storyID = ReferenceField(Story, required=True)
    fragments = ListField(DictField(), required=True, default=list)



class Request(Document):
    storyID = StringField(required=True, default="")
    contact = StringField(required=True, default="")


refreshDate = "2017/05/23"



# Configure the image uploading via Flask-Uploads
audio = UploadSet('audio', AUDIO)
configure_uploads(app, audio)
@app.route('/upload/<id>', methods=['GET', 'POST'])
def upload(id):
    if request.method == 'POST' and 'audio' in request.files:
        filename = audio.save(request.files['audio'])
        storyID = str(id)
        stories = Story.objects(id=storyID)
        story = stories[0]
        audioPath = './project/static/uploads/' + filename
        print ("Audio path: " + audioPath)
        fragments = CreateTiming.alignTextToAudio(story, audioPath)
        timings = Timings(storyID=storyID, fragments=fragments)
        timings.save()

        StoryMaker.createMovieWithAudio(story.id,
                                        story.gifURLS,
                                        story.sentences,
                                        fragments,
                                        audioPath)

        filename = str(story.id) + '.mp4'
        return redirect(url_for('saved', id=storyID, filename=filename))

    return render_template('upload.html', id=id)

@app.route('/saved/<id>')
def savedNoFile(id):
    return render_template('saved.html', id=id)

@app.route('/saved/<id>/<filename>')
def saved(id, filename):
    return render_template('saved.html', id=id, filename=filename)



@app.route("/")
def home():
    stories = []
    for story in Story.objects:
        stories.append(story)
    return render_template('home.html', stories = stories, toDate=refreshDate)


@app.route("/secret/all")
def all():
    stories = []
    for story in Story.objects:
        stories.append(story)
    return render_template('listStories.html', stories = stories)


@app.route("/create")
def create():
    return render_template('react.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route("/story/<id>/<page>")
def viewStory(id, page):
    storyArray = Story.objects(id=id)
    story = storyArray[0]
    page = int(page)
    views = story.views
    length = len(story.sentences)
    print story.videoURL
    if (page >= len(story.sentences)):
        content = logo_gif_url
        sentence = "The End."
        page = -1
        story.views = story.views + 1
        story.save()
    else:
        content = story.gifURLS[page].replace('.gif', '.mp4', 1)
        sentence = story.sentences[page]

    gifURL = story.gifURLS[0].replace('.mp4', '.gif', 1);
    shareData = {
        "link" : "https://penguinjeffrey.com/story/" + id + "/" + "0",
        "gif" : gifURL,
        "sentence" : story.sentences[0]
    }

    return render_template("viewStory.html", story = story, content = content, sentence = sentence,
    count = page, views = views, length = length, shareData = shareData)

@app.route("/story/<id>")
def videoStory(id):
    storyArray = Story.objects(id=id)
    story = storyArray[0]
    videoURL = story.videoURL
    externalURL = story.externalURL
    shareLink = "https://penguinjeffrey.com/story/" + id + "/" + "0"
    return render_template("viewVideoStory.html", story = story, videoURL = videoURL,
                                                shareLink = shareLink, externalURL = externalURL)


@app.route("/createGIFStory/<int:page>", methods=["POST"])
def createGIFStory(page):
    story = request.form['story']
    sentences = convertToStory.convertToStoryToArray(story)

    if (page >= len(sentences)):
        page = -1
    else:
        sentence = sentences[page]
        sentenceParts, gifURLS, gifMP4S =  sentenceToText.getGifsFromSentence(sentence.raw, 3)

    if (page == -1):
        sentence = ""
        gifURLS = [logo_gif_url]

    resp = make_response(render_template('createGIFStory.html', story = story, contents = gifURLS,
        sentence = sentence, count = page))
    if (page == 0):
        #no saved gifs yet
        resp.set_cookie('savedGIFS', "[]")
    else:
        savedGIFS = literal_eval(request.cookies.get('savedGIFS'))
        selectedGIF = request.form['selectedGIF']
        savedGIFS.append(selectedGIF)
        resp.set_cookie('savedGIFS', jsonify(savedGIFS).get_data())

    return resp


@app.route("/saveStory", methods=["GET", "POST"])
def saveStory():
    if (request.method == "GET"):
        story = request.args.get("story")
        savedGIFS = literal_eval(request.cookies.get('savedGIFS'))
        sentences = convertToStory.convertToStoryToArray(story)
        return render_template("saveStory.html", story = story, sentences = sentences, contents = savedGIFS)


    print "saving story"
    story = request.form['story']
    title = request.form['title']
    urls = literal_eval(request.form['urls'])
    sentences = convertToStory.convertToStoryToArray(story)

    stringArray = []
    for sentence in sentences:
        #we're stuck in ascii currently, so we get rid of common english unicode
        sentence = StringConversion.replaceUnicode(sentence.raw)
        stringArray.append(sentence)
    title = StringConversion.replaceUnicode(title)
    if (title == ""):
        title = stringArray[0]
    story = Story(  title=title,
                    sentences=stringArray,
                    gifURLS=urls,
                    isDraft=False)

    story.save()
    return render_template('savedStory.html', storyID = story.id)

#Experimental routes

class Tracker(object):
    def __init__(self, startLetter, startCount):
        self.letter = startLetter
        self.count = startCount
    def increment(self):
        if (self.count == 26):
            self.count = 1
            self.letter = chr(ord(self.letter) + 1)
        else:
            self.count += 1



@app.route("/render/<id>")
def render(id):
    storyArray = Story.objects(id=str(id))
    if storyArray == []:
        return render_template('home.html')
    story = storyArray[0]


    #Each file must be uniquely named an in alphabetical order
    tracker = Tracker('a', 1)
    errorFiles = []
    fileRoot = "../Auto/" +  str(story.id)
    if not os.path.isdir(fileRoot):
        os.mkdir(fileRoot)

    #This loop supports up to 650 unique names
    for idx, url in enumerate(story.gifURLS):
        fileName = tracker.letter * tracker.count
        tracker.increment()
        downloadLink = url.replace('-downsized-large', '', 1).replace('.gif', '.mp4', 1)
        f, headers = urllib.urlretrieve(downloadLink, (fileRoot + "/" +fileName + ".mp4"))
        print f

    if (errorFiles == []):
        filePath = fileRoot + ".json"
    else:
        filePath = "../Staging/" + str(story.id)+ ".json"
    #Write json to Auto folder
    parsed = json.loads(story.to_json())
    pretty = json.dumps(parsed, indent=4, sort_keys=True)

    f = open(filePath, 'w')
    f.write(pretty)
    f.close()



    return render_template('render.html', filePath = filePath, errors = errorFiles)

@app.route("/secret/generate", methods=["GET", "POST"])
def generateStory():
    if (request.method == "GET"):
        return render_template("generate.html")

    story = request.form['story']
    sentences = convertToStory.convertToStoryToArray(story)
    selectedGIFS = []

    for sentence in sentences:
        sentenceParts, gifURLS, gifMP4S =  sentenceToText.getGifsFromSentence(sentence.raw, 1)
        gifURL = gifURLS[0]
        selectedGIFS.append(gifURL)

    return render_template("saveStory.html", story = story, sentences = sentences, contents = selectedGIFS)



@app.route("/api/saveStory", methods=["POST"])
def saveStoryAPI():
    print request.get_json();
    json = request.get_json();
    sentences = json['sentences']
    title = json['title']
    urls = json['urls']


    if (len(sentences) == 0):
        return redirect(url_for('home'))

    if (title == ""):
        title = sentences[0]

    newStory = Story(   title=title,
                        sentences=sentences,
                        gifURLS=urls,
                        isDraft=False)
    newStory.save()
    return jsonify(id=str(newStory.id))



@app.route("/api/translate")
def getTranslate():
    sentence = request.args.get("q")

@app.route('/api/generate', methods = ["POST"])
def generateContent():
    json = request.get_json();
    textBlob = json['story']
    sentences = convertToStory.convertToStoryToArray(textBlob)

    selectedGIFS = []
    rawSentences = []
    for sentence in sentences:
        sentenceParts, gifURLS, gifMP4S =  sentenceToText.getGifsFromSentence(sentence.raw, 1)
        gifURL = gifMP4S[0]
        selectedGIFS.append(gifURL)
        rawSentences.append(sentence.raw)

    return jsonify(sentences=rawSentences, urls=selectedGIFS)

@app.route("/api/update", methods = ["POST"])
def updateContent():
    json = request.get_json();
    sentences = json['sentences']
    urls = json['urls']
    selected = json['selected']

    newURLS = []
    for idx, isSelected in enumerate(selected):
        #keep selected urls
        if (isSelected):
            newURLS.append(urls[idx])
        else:
            parts, gifURLS, mp4s = sentenceToText.getGifsFromSentence(sentences[idx], 1)
            newURLS.append(mp4s[0])

    return jsonify(sentences=sentences, urls=newURLS, selected=selected)



@app.route("/api/<contentType>")
def getContent(contentType):
    text = request.args.get("q")
    print("query: " + text)
    if (contentType == "gifs"):
        print "gifs"
        parts, urls, mp4s = sentenceToText.getGifsFromSentence(text, 3)
        return jsonify(urls=mp4s)
    elif (contentType == "pics"):
        print "pics"
    elif (contentType == "vids"):
        print "vids"
    else:
        print "other"
        return []



#test: 5918d18159840b0009258fb4
@app.route('/api/render/<id>')
def renderAPI(id):
    stories = Story.objects(id=id)
    story = stories[0]
    StoryMaker.createMovieWithText(story.id, story.gifURLS, story.sentences)

    filename = str(id) + '.mp4'
    return render_template('savedVideo.html', filename=filename)


@app.route("/download/<filename>")
def download(filename):
    uploads = os.path.join(current_app.root_path, '../CreatedStories/New/')
    pathFile = uploads + filename

    print uploads
    print pathFile
    return send_from_directory(directory=uploads, filename=filename)



if __name__ == "__main__":
    app.run()
