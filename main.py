from flask import Flask, render_template, request, jsonify, make_response, send_from_directory

app = Flask(__name__)


from ast import literal_eval
import HTMLParser
import json
import os
import urllib
import sentenceToText
import pixabayAPI
import convertToStory
import StringConversion
logo_gif_url = "https://media.giphy.com/media/VkMV9TldsPd28/giphy.gif"


#DATABASE_MONGODB
from mongoengine import *
from mongoengine import connect
from datetime import *
connect("extendV0", host='mongodb://penguinjeffrey:ilikefish12@ds147711.mlab.com:47711/heroku_sl5vqjfj')

class Story(Document):
    title = StringField(required=True, default="")
    sentences = ListField(StringField(), required=True, default=list)
    gifURLS = ListField(URLField(), required=True, default=list)
    videoURL = StringField(default="")
    isPublic = BooleanField(default=True)
    views = IntField(default=0)
    created = DateTimeField(default=datetime.now())
    isDraft = BooleanField(default=True)

class Request(Document):
    storyID = StringField(required=True, default="")
    contact = StringField(required=True, default="")

class Feedback(Document):
    feedback = StringField(required=True, default="")

refreshDate = "2017/05/23"

@app.route("/test")
def test():
    return render_template("canvas.html")

@app.route("/create")
def create():
    return render_template('create.html')

@app.route("/")
def home():
    stories = []
    for story in Story.objects:
        stories.append(story)
    return render_template('home.html', stories = stories, toDate=refreshDate)


@app.route("/featured/<int:page>")
def featured(page):
    if (int(page) >= len(videoURLS)):
        return render_template('end.html', toDate = refreshDate)
    else:
        return render_template('featured.html', page = page,
                                                videoURL = videoURLS[int(page)])



@app.route("/story/<id>/<page>")
def story(id, page):
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
        content = story.gifURLS[page]
        sentence = story.sentences[page]

    shareData = {
        "link" : "https://penguinjeffrey.herokuapp.com/story/" + id + "/" + "0",
        "gif" : story.gifURLS[0],
        "sentence" : story.sentences[0]
    }

    return render_template("viewStory.html", story = story, content = content, sentence = sentence,
    count = page, views = views, length = length, shareData = shareData)

@app.route("/story/<id>")
def videoStory(id):
    storyArray = Story.objects(id=id)
    story = storyArray[0]
    videoURL = story.videoURL
    shareLink = "https://penguinjeffrey.herokuapp.com/story/" + id + "/" + "0"
    return render_template("viewVideoStory.html", story = story, videoURL = videoURL, shareLink = shareLink)


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
                    gifURLS=urls)
    story.save()
    return render_template('savedStory.html', storyID = story.id)

@app.route("/videoRequest", methods=["POST"])
def videoRequest():
    contact = request.form["contact"]
    storyID = request.form["storyID"]
    newRequest = Request(storyID=storyID, contact=contact)
    newRequest.save()
    return render_template("saved.html")

@app.route("/feedback", methods=["POST"])
def feedback():
    feedback = request.form["feedback"]
    newFeedback = Feedback(feedback=feedback)
    newFeedback.save()
    return render_template("feedback.html")

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
    storyArray = Story.objects(id=id)
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

@app.route("/generate", methods=["GET", "POST"])
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

@app.route("/api/translate")
def getTranslate():
    sentence = request.args.get("text")


@app.route("/api/<contentType>")
def getContent(contentType):
    text = request.args.get("text")
    if (contentType == "gifs"):
        print "gifs"
        parts, urls, mp4s = sentenceToText.getGifsFromSentence(text, 3)
        return jsonify(urls)
    elif (contentType == "pics"):
        print "pics"
    elif (contentType == "vids"):
        print "vids"
    else:
        print "other"
        return []

if __name__ == "__main__":
    app.run()
