import os, json
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

filename = os.path.join(app.static_folder, 'data.json')
with open(filename) as data:
    data = json.load(data)['data']

@app.route('/')

def home():
  global data
  return render_template('home.html', data=data)
