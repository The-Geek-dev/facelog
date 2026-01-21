import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import cv2
import numpy as np
import sqlite3
import base64
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import json
from deepface import DeepFace
import tempfile
import csv
from io import StringIO, BytesIO
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch
import hashlib

app = Flask(__name__)
CORS(app)

# Create directories
FACES_DIR = 'student_faces'
if not os.path.exists(FACES_DIR):
    os.makedirs(FACES_DIR)

# Simple auth (in production, use proper authentication)
ADMIN_PASSWORD_HASH = hashlib.sha256("admin123".encode()).hexdigest()

# Initialize database with enhanced schema
def init_db():
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    
    # Students table
    c.execute('''CREATE TABLE IF NOT EXISTS students
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  student_id TEXT UNIQUE NOT NULL,
                  email TEXT,
                  class_section TEXT DEFAULT 'Default',
                  image_path TEXT NOT NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    # Attendance table
    c.execute('''CREATE TABLE IF NOT EXISTS attendance
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  student_id TEXT NOT NULL,
                  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  marked_by TEXT DEFAULT 'auto',
                  class_section TEXT DEFAULT 'Default',
                  FOREIGN KEY (student_id) REFERENCES students(student_id))''')
    
    # Classes table
    c.execute('''CREATE TABLE IF NOT EXISTS classes
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  class_name TEXT UNIQUE NOT NULL,
                  description TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    # Audit logs table
    c.execute('''CREATE TABLE IF NOT EXISTS audit_logs
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  action TEXT NOT NULL,
                  details TEXT,
                  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    # Insert default class
    c.execute("INSERT OR IGNORE INTO classes (class_name, description) VALUES ('Default', 'Default Class')")
    
    conn.commit()
    conn.close()

init_db()

def log_action(action, details=""):
    """Log actions for audit trail"""
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    c.execute('INSERT INTO audit_logs (action, details) VALUES (?, ?)', (action, details))
    conn.commit()
    conn.close()

def save_image_from_base64(image_data, filename):
    """Save base64 image to file"""
    image_bytes = base64.b64decode(image_data)
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    filepath = os.path.join(FACES_DIR, filename)
    cv2.imwrite(filepath, image)
    return filepath

def image_to_temp_file(image_data):
    """Convert base64 image to temporary file for DeepFace"""
    image_bytes = base64.b64decode(image_data)
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
    cv2.imwrite(temp_file.name, image)
    return temp_file.name

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Simple authentication"""
    data = request.json
    password = data.get('password', '')
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    if password_hash == ADMIN_PASSWORD_HASH:
        log_action('LOGIN', 'Admin logged in')
        return jsonify({'success': True, 'message': 'Login successful'})
    else:
        return jsonify({'success': False, 'message': 'Invalid password'}), 401

@app.route('/api/register', methods=['POST'])
def register_student():
    try:
        data = request.json
        name = data['name']
        student_id = data['student_id']
        email = data.get('email', '')
        class_section = data.get('class_section', 'Default')
        image_data = data['image'].split(',')[1]
        
        # Verify face detection
        temp_path = image_to_temp_file(image_data)
        
        try:
            faces = DeepFace.extract_faces(temp_path, detector_backend='opencv', enforce_detection=True)
            
            if len(faces) == 0:
                os.unlink(temp_path)
                return jsonify({'error': 'No face detected in image'}), 400
            
            if len(faces) > 1:
                os.unlink(temp_path)
                return jsonify({'error': 'Multiple faces detected. Please use an image with only one face'}), 400
            
        except Exception as e:
            os.unlink(temp_path)
            return jsonify({'error': f'Face detection failed: {str(e)}'}), 400
        
        # Save image permanently
        filename = f"{student_id}.jpg"
        filepath = save_image_from_base64(image_data, filename)
        os.unlink(temp_path)
        
        # Store in database
        conn = sqlite3.connect('attendance.db')
        c = conn.cursor()
        c.execute('INSERT INTO students (name, student_id, email, class_section, image_path) VALUES (?, ?, ?, ?, ?)',
                  (name, student_id, email, class_section, filepath))
        conn.commit()
        conn.close()
        
        log_action('REGISTER_STUDENT', f'Student {name} ({student_id}) registered')
        
        return jsonify({'message': f'Student {name} registered successfully'})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Student ID already exists'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/register/bulk', methods=['POST'])
def bulk_register():
    """Bulk register students from CSV"""
    try:
        data = request.json
        students = data.get('students', [])
        
        conn = sqlite3.connect('attendance.db')
        c = conn.cursor()
        
        success_count = 0
        errors = []
        
        for student in students:
            try:
                c.execute('INSERT INTO students (name, student_id, email, class_section, image_path) VALUES (?, ?, ?, ?, ?)',
                          (student['name'], student['student_id'], student.get('email', ''), 
                           student.get('class_section', 'Default'), ''))
                success_count += 1
            except sqlite3.IntegrityError:
                errors.append(f"Student ID {student['student_id']} already exists")
        
        conn.commit()
        conn.close()
        
        log_action('BULK_REGISTER', f'{success_count} students registered')
        
        return jsonify({
            'success': success_count,
            'errors': errors
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recognize', methods=['POST'])
def recognize_face():
    temp_path = None
    try:
        data = request.json
        image_data = data['image'].split(',')[1]
        class_section = data.get('class_section', 'Default')
        
        temp_path = image_to_temp_file(image_data)
        
        try:
            faces = DeepFace.extract_faces(temp_path, detector_backend='opencv', enforce_detection=True)
            if len(faces) == 0:
                os.unlink(temp_path)
                return jsonify({'error': 'No face detected'}), 400
        except Exception as e:
            if temp_path and os.path.exists(temp_path):
                os.unlink(temp_path)
            return jsonify({'error': 'No face detected in image'}), 400
        
        conn = sqlite3.connect('attendance.db')
        c = conn.cursor()
        c.execute('SELECT student_id, name, image_path FROM students WHERE class_section = ?', (class_section,))
        students = c.fetchall()
        
        if len(students) == 0:
            conn.close()
            os.unlink(temp_path)
            return jsonify({'error': 'No students registered in this class'}), 400
        
        recognized = []
        
        for student_id, name, stored_image_path in students:
            try:
                result = DeepFace.verify(
                    temp_path, 
                    stored_image_path,
                    model_name='VGG-Face',
                    detector_backend='opencv',
                    enforce_detection=False
                )
                
                if result['verified']:
                    c.execute('INSERT INTO attendance (student_id, marked_by, class_section) VALUES (?, ?, ?)', 
                             (student_id, 'auto', class_section))
                    conn.commit()
                    
                    confidence = 1 - result['distance']
                    recognized.append({
                        'student_id': student_id,
                        'name': name,
                        'confidence': float(confidence)
                    })
                    
                    log_action('MARK_ATTENDANCE', f'Auto: {name} ({student_id})')
                    break
                    
            except Exception as e:
                continue
        
        conn.close()
        os.unlink(temp_path)
        
        if recognized:
            return jsonify({'recognized': recognized})
        else:
            return jsonify({'error': 'Face not recognized'}), 404
            
    except Exception as e:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)
        return jsonify({'error': str(e)}), 500

@app.route('/api/attendance/manual', methods=['POST'])
def mark_manual_attendance():
    """Manually mark attendance"""
    try:
        data = request.json
        student_id = data['student_id']
        class_section = data.get('class_section', 'Default')
        
        conn = sqlite3.connect('attendance.db')
        c = conn.cursor()
        
        # Check if student exists
        c.execute('SELECT name FROM students WHERE student_id = ?', (student_id,))
        student = c.fetchone()
        
        if not student:
            conn.close()
            return jsonify({'error': 'Student not found'}), 404
        
        c.execute('INSERT INTO attendance (student_id, marked_by, class_section) VALUES (?, ?, ?)',
                  (student_id, 'manual', class_section))
        conn.commit()
        conn.close()
        
        log_action('MARK_ATTENDANCE', f'Manual: {student[0]} ({student_id})')
        
        return jsonify({'message': f'Attendance marked for {student[0]}'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/students', methods=['GET'])
def get_students():
    class_section = request.args.get('class_section', None)
    search = request.args.get('search', '')
    
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    
    if class_section:
        c.execute('''SELECT student_id, name, email, class_section, created_at 
                     FROM students WHERE class_section = ? AND (name LIKE ? OR student_id LIKE ?)''',
                  (class_section, f'%{search}%', f'%{search}%'))
    else:
        c.execute('''SELECT student_id, name, email, class_section, created_at 
                     FROM students WHERE name LIKE ? OR student_id LIKE ?''',
                  (f'%{search}%', f'%{search}%'))
    
    students = c.fetchall()
    conn.close()
    
    return jsonify([{
        'student_id': s[0],
        'name': s[1],
        'email': s[2],
        'class_section': s[3],
        'created_at': s[4]
    } for s in students])

@app.route('/api/students/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        conn = sqlite3.connect('attendance.db')
        c = conn.cursor()
        
        c.execute('SELECT name, image_path FROM students WHERE student_id = ?', (student_id,))
        result = c.fetchone()
        
        if result:
            name, image_path = result
            if os.path.exists(image_path):
                os.remove(image_path)
            
            c.execute('DELETE FROM students WHERE student_id = ?', (student_id,))
            c.execute('DELETE FROM attendance WHERE student_id = ?', (student_id,))
            conn.commit()
            
            log_action('DELETE_STUDENT', f'{name} ({student_id})')
        
        conn.close()
        return jsonify({'message': 'Student deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    class_section = request.args.get('class_section', None)
    
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    
    if class_section:
        c.execute('''SELECT a.student_id, s.name, a.timestamp, a.marked_by
                     FROM attendance a 
                     JOIN students s ON a.student_id = s.student_id 
                     WHERE DATE(a.timestamp) = ? AND a.class_section = ?
                     ORDER BY a.timestamp DESC''', (date, class_section))
    else:
        c.execute('''SELECT a.student_id, s.name, a.timestamp, a.marked_by
                     FROM attendance a 
                     JOIN students s ON a.student_id = s.student_id 
                     WHERE DATE(a.timestamp) = ?
                     ORDER BY a.timestamp DESC''', (date,))
    
    records = c.fetchall()
    conn.close()
    
    return jsonify([{
        'student_id': r[0],
        'name': r[1],
        'timestamp': r[2],
        'marked_by': r[3]
    } for r in records])

@app.route('/api/attendance/range', methods=['GET'])
def get_attendance_range():
    """Get attendance for date range"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    class_section = request.args.get('class_section', None)
    
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    
    if class_section:
        c.execute('''SELECT s.student_id, s.name, COUNT(DISTINCT DATE(a.timestamp)) as days_present
                     FROM students s
                     LEFT JOIN attendance a ON s.student_id = a.student_id 
                     AND DATE(a.timestamp) BETWEEN ? AND ?
                     WHERE s.class_section = ?
                     GROUP BY s.student_id, s.name
                     ORDER BY s.name''', (start_date, end_date, class_section))
    else:
        c.execute('''SELECT s.student_id, s.name, COUNT(DISTINCT DATE(a.timestamp)) as days_present
                     FROM students s
                     LEFT JOIN attendance a ON s.student_id = a.student_id 
                     AND DATE(a.timestamp) BETWEEN ? AND ?
                     GROUP BY s.student_id, s.name
                     ORDER BY s.name''', (start_date, end_date))
    
    records = c.fetchall()
    conn.close()
    
    # Calculate total days
    start = datetime.strptime(start_date, '%Y-%m-%d')
    end = datetime.strptime(end_date, '%Y-%m-%d')
    total_days = (end - start).days + 1
    
    return jsonify({
        'records': [{
            'student_id': r[0],
            'name': r[1],
            'days_present': r[2],
            'total_days': total_days,
            'percentage': round((r[2] / total_days * 100), 2) if total_days > 0 else 0
        } for r in records],
        'total_days': total_days
    })

@app.route('/api/analytics/dashboard', methods=['GET'])
def get_dashboard_analytics():
    """Get analytics for dashboard"""
    days = int(request.args.get('days', 7))
    class_section = request.args.get('class_section', None)
    
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    
    # Total students
    if class_section:
        c.execute('SELECT COUNT(*) FROM students WHERE class_section = ?', (class_section,))
    else:
        c.execute('SELECT COUNT(*) FROM students')
    total_students = c.fetchone()[0]
    
    # Today's attendance
    today = datetime.now().strftime('%Y-%m-%d')
    if class_section:
        c.execute('SELECT COUNT(DISTINCT student_id) FROM attendance WHERE DATE(timestamp) = ? AND class_section = ?', 
                 (today, class_section))
    else:
        c.execute('SELECT COUNT(DISTINCT student_id) FROM attendance WHERE DATE(timestamp) = ?', (today,))
    today_present = c.fetchone()[0]
    
    # Average attendance last N days
    start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
    if class_section:
        c.execute('''SELECT DATE(timestamp), COUNT(DISTINCT student_id) 
                     FROM attendance 
                     WHERE DATE(timestamp) >= ? AND class_section = ?
                     GROUP BY DATE(timestamp)''', (start_date, class_section))
    else:
        c.execute('''SELECT DATE(timestamp), COUNT(DISTINCT student_id) 
                     FROM attendance 
                     WHERE DATE(timestamp) >= ?
                     GROUP BY DATE(timestamp)''', (start_date,))
    
    daily_attendance = c.fetchall()
    
    # Top attendees
    if class_section:
        c.execute('''SELECT s.student_id, s.name, COUNT(a.id) as attendance_count
                     FROM students s
                     LEFT JOIN attendance a ON s.student_id = a.student_id
                     WHERE s.class_section = ?
                     GROUP BY s.student_id
                     ORDER BY attendance_count DESC
                     LIMIT 5''', (class_section,))
    else:
        c.execute('''SELECT s.student_id, s.name, COUNT(a.id) as attendance_count
                     FROM students s
                     LEFT JOIN attendance a ON s.student_id = a.student_id
                     GROUP BY s.student_id
                     ORDER BY attendance_count DESC
                     LIMIT 5''')
    
    top_attendees = c.fetchall()
    
    # Absent today
    if class_section:
        c.execute('''SELECT s.student_id, s.name
                     FROM students s
                     WHERE s.class_section = ? AND s.student_id NOT IN (
                         SELECT student_id FROM attendance WHERE DATE(timestamp) = ?
                     )''', (class_section, today))
    else:
        c.execute('''SELECT s.student_id, s.name
                     FROM students s
                     WHERE s.student_id NOT IN (
                         SELECT student_id FROM attendance WHERE DATE(timestamp) = ?
                     )''', (today,))
    
    absent_today = c.fetchall()
    
    conn.close()
    
    return jsonify({
        'total_students': total_students,
        'today_present': today_present,
        'today_absent': total_students - today_present,
        'today_percentage': round((today_present / total_students * 100), 2) if total_students > 0 else 0,
        'daily_attendance': [{'date': d[0], 'count': d[1]} for d in daily_attendance],
        'top_attendees': [{'student_id': t[0], 'name': t[1], 'count': t[2]} for t in top_attendees],
        'absent_today': [{'student_id': a[0], 'name': a[1]} for a in absent_today]
    })

@app.route('/api/export/csv', methods=['GET'])
def export_csv():
    """Export attendance to CSV"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    class_section = request.args.get('class_section', None)
    
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    
    if class_section:
        c.execute('''SELECT a.student_id, s.name, s.email, s.class_section, a.timestamp, a.marked_by
                     FROM attendance a
                     JOIN students s ON a.student_id = s.student_id
                     WHERE DATE(a.timestamp) BETWEEN ? AND ? AND a.class_section = ?
                     ORDER BY a.timestamp DESC''', (start_date, end_date, class_section))
    else:
        c.execute('''SELECT a.student_id, s.name, s.email, s.class_section, a.timestamp, a.marked_by
                     FROM attendance a
                     JOIN students s ON a.student_id = s.student_id
                     WHERE DATE(a.timestamp) BETWEEN ? AND ?
                     ORDER BY a.timestamp DESC''', (start_date, end_date))
    
    records = c.fetchall()
    conn.close()
    
    # Create CSV
    si = StringIO()
    writer = csv.writer(si)
    writer.writerow(['Student ID', 'Name', 'Email', 'Class', 'Timestamp', 'Marked By'])
    writer.writerows(records)
    
    output = BytesIO()
    output.write(si.getvalue().encode('utf-8'))
    output.seek(0)
    
    log_action('EXPORT_CSV', f'Attendance exported for {start_date} to {end_date}')
    
    return send_file(output, mimetype='text/csv', as_attachment=True, 
                     download_name=f'attendance_{start_date}_{end_date}.csv')

@app.route('/api/export/pdf', methods=['GET'])
def export_pdf():
    """Export attendance report to PDF"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    class_section = request.args.get('class_section', 'All')
    
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    
    if class_section != 'All':
        c.execute('''SELECT s.student_id, s.name, COUNT(DISTINCT DATE(a.timestamp)) as days_present
                     FROM students s
                     LEFT JOIN attendance a ON s.student_id = a.student_id
                     AND DATE(a.timestamp) BETWEEN ? AND ?
                     WHERE s.class_section = ?
                     GROUP BY s.student_id, s.name
                     ORDER BY s.name''', (start_date, end_date, class_section))
    else:
        c.execute('''SELECT s.student_id, s.name, COUNT(DISTINCT DATE(a.timestamp)) as days_present
                     FROM students s
                     LEFT JOIN attendance a ON s.student_id = a.student_id
                     AND DATE(a.timestamp) BETWEEN ? AND ?
                     GROUP BY s.student_id, s.name
                     ORDER BY s.name''', (start_date, end_date))
    
    records = c.fetchall()
    conn.close()
    
    # Calculate total days
    start = datetime.strptime(start_date, '%Y-%m-%d')
    end = datetime.strptime(end_date, '%Y-%m-%d')
    total_days = (end - start).days + 1
    
    # Create PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#667eea'),
        spaceAfter=30,
        alignment=1
    )
    
    # Title
    elements.append(Paragraph('Attendance Report', title_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Info
    info_style = styles['Normal']
    elements.append(Paragraph(f'<b>Period:</b> {start_date} to {end_date}', info_style))
    elements.append(Paragraph(f'<b>Class:</b> {class_section}', info_style))
    elements.append(Paragraph(f'<b>Total Days:</b> {total_days}', info_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Table data
    data = [['Student ID', 'Name', 'Days Present', 'Attendance %']]
    for r in records:
        percentage = round((r[2] / total_days * 100), 2) if total_days > 0 else 0
        data.append([r[0], r[1], str(r[2]), f'{percentage}%'])
    
    # Create table
    table = Table(data, colWidths=[1.5*inch, 2.5*inch, 1.5*inch, 1.5*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
    ]))
    
    elements.append(table)
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    
    log_action('EXPORT_PDF', f'PDF report generated for {start_date} to {end_date}')
    
    return send_file(buffer, mimetype='application/pdf', as_attachment=True,
                     download_name=f'attendance_report_{start_date}_{end_date}.pdf')

@app.route('/api/classes', methods=['GET'])
def get_classes():
    """Get all classes"""
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    c.execute('SELECT class_name, description FROM classes')
    classes = c.fetchall()
    conn.close()
    
    return jsonify([{'name': c[0], 'description': c[1]} for c in classes])

@app.route('/api/classes', methods=['POST'])
def create_class():
    """Create new class"""
    try:
        data = request.json
        class_name = data['class_name']
        description = data.get('description', '')
        
        conn = sqlite3.connect('attendance.db')
        c = conn.cursor()
        c.execute('INSERT INTO classes (class_name, description) VALUES (?, ?)', (class_name, description))
        conn.commit()
        conn.close()
        
        log_action('CREATE_CLASS', f'Class {class_name} created')
        
        return jsonify({'message': 'Class created successfully'})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Class already exists'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/audit-logs', methods=['GET'])
def get_audit_logs():
    """Get audit logs"""
    limit = int(request.args.get('limit', 50))
    
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    c.execute('SELECT action, details, timestamp FROM audit_logs ORDER BY timestamp DESC LIMIT ?', (limit,))
    logs = c.fetchall()
    conn.close()
    
    return jsonify([{
        'action': l[0],
        'details': l[1],
        'timestamp': l[2]
    } for l in logs])

if __name__ == '__main__':
    app.run(debug=True, port=5000)