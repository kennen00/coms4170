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

@app.route('/learn/<int:rudiment_id>')
def learn(rudiment_id):
  global data
  rudiment = next((r for r in data if r['id'] == rudiment_id), None)
  return render_template('learn.html', rudiment=rudiment)
