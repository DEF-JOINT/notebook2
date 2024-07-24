from flask import Flask
from flask import render_template


app = Flask('main')

app = Flask(__name__)
app.static_folder = 'templates/static'


@app.route('/')
def main_view():
    return render_template('index.html')


app.run('0.0.0.0', 80)
