from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and check_password_hash(user.password, data['password']):
        return jsonify({"success": True})
    return jsonify({"success": False})

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    hashed_password = generate_password_hash(data['password'], method='sha256')
    new_user = User(username=data['username'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"success": True})

if __name__ == '__main__':
    db.create_all()
    # Create initial admin user
    admin = User.query.filter_by(username="ADMIN").first()
    if not admin:
        admin_password = generate_password_hash("password", method='sha256')
        admin = User(username="ADMIN", password=admin_password)
        db.session.add(admin)
        db.session.commit()
    app.run(debug=True)