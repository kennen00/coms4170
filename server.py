import os, json, random, uuid
from flask import Flask, render_template, request, jsonify, url_for

app = Flask(__name__)

filename = os.path.join(app.static_folder, 'data.json')
with open(filename) as f:
    loaded = json.load(f)
data = loaded['data']
quiz_data = loaded['quiz_data']

quizzes = {}

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

def render_quiz_state(quiz_id):
  quiz = quizzes[quiz_id]
  if quiz['position'] >= quiz['total']:
    return render_template(
      'quiz_score.html',
      score=quiz['score'],
      total=quiz['total'],
    )
  question = quiz['order'][quiz['position']]
  return render_template(
    'quiz.html',
    rudiment=question,
    sequence_length=len(question['sequence']),
    quiz_id=quiz_id,
    q_num=quiz['position'] + 1,
    total=quiz['total'],
  )

@app.route('/record')
def record():
  return render_template('record.html')

@app.route('/quiz/new')
def quiz_new():
  quiz_id = uuid.uuid4().hex
  quizzes[quiz_id] = {
    'order': random.sample(quiz_data, k=len(quiz_data)),
    'position': 0,
    'score': 0,
    'total': len(quiz_data),
  }
  return render_quiz_state(quiz_id)

@app.route('/quiz/<quiz_id>')
def quiz(quiz_id):
  return render_quiz_state(quiz_id)

@app.route('/quiz/<quiz_id>/submit', methods=['POST'])
def quiz_submit(quiz_id):
  quiz = quizzes[quiz_id]

  expected = quiz['order'][quiz['position']]['sequence']

  submitted = (request.get_json() or {}).get('sequence', [])
  correct = submitted == expected
  if correct:
    quiz['score'] += 1
  quiz['position'] += 1

  return jsonify({'correct': correct, 'next_url': url_for('quiz', quiz_id=quiz_id)})
