import sqlite3, os
print('db path exists:', os.path.exists('test.db'))
conn=sqlite3.connect('test.db')
cur=conn.cursor()
for row in cur.execute('SELECT id, email FROM users'):
    print(row)
conn.close()
