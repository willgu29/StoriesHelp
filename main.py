from flask import Flask, render_template, request, jsonify, make_response

app = Flask(__name__)

problemID = ["meaning", "relationships", "anxiety", "identity", "none"]
renderID = ["meaning.html", "relationships.html", "anxiety.html", "identity.html", "none.html"]
videoID = ["https://www.youtube.com/embed/zbeZuTXKbK4", "", "", "", "", ""]
headlineID = ["Ah the meaning of life...", "I too have relationship problems.",
                "A worrisome feeling...", "An identity crisis!",
                "Join the cause!"]


@app.route("/")
def hello():
    return render_template('home.html')

@app.route('/problem/<problem>')
def problem(problem):
    selectIndex = problemID.index(problem)
    videoURL = videoID[selectIndex]
    headline = headlineID[selectIndex]
    return render_template('intro.html', videoURL = videoURL, headline = headline)

@app.route("/meaning")
def meaning():
    return render_template("meaning.html")

@app.route("/cause")
def cause():
    return render_template("cause.html")

if __name__ == "__main__":
    app.run()
