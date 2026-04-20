import os, json
from flask import Flask, render_template, request, jsonify, url_for

app = Flask(__name__)

filename = os.path.join(app.static_folder, 'data.json')
with open(filename) as data:
    data = json.load(data)['data']

def build_nav_data(rudiment_id, step):
  prev_rudiment = next((r for r in data if r['id'] == rudiment_id - 1), None)
  next_rudiment = next((r for r in data if r['id'] == rudiment_id + 1), None)
  
  nav = {
    'prev_url': None,
    'prev_label': None,
    'next_url': None,
    'next_label': None
  }
  
  if step == 'info':
    if prev_rudiment:
      nav['prev_url'] = url_for('learn_practice', rudiment_id=prev_rudiment['id'])
      nav['prev_label'] = '← ' + prev_rudiment['title']
  elif step == 'video':
    nav['prev_url'] = url_for('learn', rudiment_id=rudiment_id)
    nav['prev_label'] = '← Basics'
  elif step == 'practice':
    nav['prev_url'] = url_for('learn_video', rudiment_id=rudiment_id)
    nav['prev_label'] = '← Video'
  
  if step == 'info':
    nav['next_url'] = url_for('learn_video', rudiment_id=rudiment_id)
    nav['next_label'] = 'Video →'
  elif step == 'video':
    nav['next_url'] = url_for('learn_practice', rudiment_id=rudiment_id)
    nav['next_label'] = 'Practice →'
  elif step == 'practice':
    if next_rudiment:
      nav['next_url'] = url_for('learn', rudiment_id=next_rudiment['id'])
      nav['next_label'] = 'Next Rudiment →'
    else:
      nav['next_url'] = url_for('home')
      nav['next_label'] = 'Home →'
  
  return nav

@app.route('/')

def home():
  global data
  return render_template('home.html', data=data)

@app.route('/learn/<int:rudiment_id>')
def learn(rudiment_id):
  global data
  rudiment = next((r for r in data if r['id'] == rudiment_id), None)
  
  nav = build_nav_data(rudiment_id, 'info')
  return render_template('learn_info.html', rudiment=rudiment, nav=nav)

@app.route('/learn/<int:rudiment_id>/video')
def learn_video(rudiment_id):
  global data
  rudiment = next((r for r in data if r['id'] == rudiment_id), None)
  
  nav = build_nav_data(rudiment_id, 'video')
  return render_template('learn_video.html', rudiment=rudiment, nav=nav)

@app.route('/learn/<int:rudiment_id>/practice')
def learn_practice(rudiment_id):
  global data
  rudiment = next((r for r in data if r['id'] == rudiment_id), None)
  
  nav = build_nav_data(rudiment_id, 'practice')
  return render_template('learn_practice.html', rudiment=rudiment, nav=nav)
