#!/usr/bin/python -tt
# -*- coding: utf-8 -*-
import codecs
import sys
from flask import Flask, render_template, request, jsonify, make_response

#DATABASE_MONGODB
from mongoengine import *
from mongoengine import connect
connect("extendV0", host='mongodb://penguinjeffrey:ilikefish12@ds147711.mlab.com:47711/heroku_sl5vqjfj')

app = Flask(__name__)

problemID = ["meaning", "relationships", "anxiety", "identity", "none", "I'm afraid I won't make it."]
renderID = ["meaning.html", "relationships.html", "anxiety.html", "identity.html", "none.html", "afraid.html"]
videoID = ["https://www.youtube.com/embed/zbeZuTXKbK4", "", "", "", "", ""]
headlineID = ["Ah the meaning of life...", "I too have relationship problems.",
                "A worrisome feeling...", "An identity crisis!",
                "Join the cause!"]


class Problem(Document):
    title = StringField(required=True, default="")
    contact = StringField(default="")

class Nuance(Document):
    sentence = StringField(required=True, default="")

class Support(Document):
    videoURL = URLField(required=True)
    forProblem = StringField(required=True)


@app.route("/")
def hello():
    return render_template('home.html')

@app.route("/something")
def something():
    return render_template("something.html")

@app.route("/nothing")
def nothing():
    return render_template("nothing.html")

@app.route("/createProblem", methods=["POST"])
def createProblem():
    problem = request.form["problem"]
    contact = request.form["contact"]
    newProblem = Problem(title=problem,
                        contact=contact)
    newProblem.save()
    return render_template("extend.html")

@app.route("/meaning/0")
def meaning():
    return render_template("meaning.html")

@app.route("/stranger")
def stranger():
    return render_template("stranger.html")

@app.route('/meaning/1')
def meaning1():
    return render_template("meaning1.html")

@app.route("/viktor")
def viktor():
    return render_template("viktor.html")

@app.route('/meaning/2')
def meaning2():
    return render_template("meaning2.html")

@app.route("/nope")
def nope():
    return render_template("nope.html")

@app.route('/problem/<problem>')
def problem(problem):
    selectIndex = problemID.index(problem)
    videoURL = videoID[selectIndex]
    headline = headlineID[selectIndex]
    return render_template('intro.html', videoURL = videoURL, headline = headline)

@app.route("/past/<problem>")
def past(problem):
    return render_template("past.html", problem = problem)


afraidVideos = []
afraidHeadlines = ["Ah... is it a fear of failure?", "Then maybe it's actually a fear of success!",
"Hmm.. I'm not sure then. Maybe you can tell me for the next person..."]
@app.route("/afraid/<step>")
def afraid(step):
    headline = ""
    getInput = False
    if (step >= len(afraidHeadlines)):
        headline = "What do you think the problem is?"
        getInput = True
    else:
        headline = afraidHeadlines[step]
    return render_template("afraid.html", headline = headline, getInput = getInput)


@app.route("/addNuance", methods=["POST"])
def addNuance():
    sentence = request.form['nuance']
    newNuance = Nuance(sentence=sentence)
    newNuance.save()
    return render_template("nuance.html")

meaningVideos = []
meaningHeadlines = ["Ah... do you feel like there is no meaning?", "Then maybe you're just not sure what yours is?",
"Hmm.. I'm not sure then. Maybe you can tell me for the next person..."]


@app.route("/cause")
def cause():
    return render_template("cause.html")

if __name__ == "__main__":
    app.run()
