const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const cors = require('cors');

const app = express()
const port = process.env.PORT || 5000

app.use(bodyParser.urlencoded({extended: false}))
app.use(cors());
app.use(bodyParser.json())

// MySQL
const pool= mysql.createPool({
    connectionLimit :   10,
    host:               'localhost',
    user:               'root',
    password:           null,
    database:           'airplane'
})

app.post('/register', (req, res) => {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log(`Connected as id ${connection.threadId}`);
  
      const { user_name, email,  password } = req.body;
      const params = { user_name, email, password };
  
      connection.query('INSERT INTO Users SET ?', params, (err, result) => {
        connection.release();
  
        if (!err) {
          res.status(200).send(`User with the Record ID: ${result.insertId} has been registered`);
        } else {
          console.error(err);
          res.status(500).send('Error registering user');
        }
      });
  
      console.log(req.body);
    });
  });
  app.post('/login', (req, res) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error connecting to the database:', err);
        throw err;
      }
      console.log(`Connected as id ${connection.threadId}`);
  
      const { email, password } = req.body;
  
      connection.query('SELECT * FROM Users WHERE email = ? AND password = ?', [email, password], (err, result) => {
        connection.release();
  
        if (!err) {
          if (result.length > 0) {
            res.status(200).send('Login successful');
          } else {
            res.status(401).send('Invalid email or password');
          }
        } else {
          console.error('Error during login:', err);
          res.status(500).send('Error during login');
        }
      });
  
      console.log(req.body);
    });
  });
  app.post('/logout', (req, res) => {
    res.status(200).send('Logout successful');
  });
  
//show tables
app.get('', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('show tables; ', (err, rows) => {
            connection.release()

            if(!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})

// users tábla kilistázása
app.get('/users', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('SELECT * FROM users', (err, rows) => {
            connection.release()

            if(!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})

//user_id alapján user kilistázása
app.get('/users/:user_id', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('SELECT * FROM users WHERE user_id = ?',[req.params.user_id], (err, rows) => {
            connection.release()

            if(!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})

//user_id alapján user törlése
app.delete('/users/:user_id', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('DELETE FROM users WHERE user_id = ?',[req.params.user_id], (err, rows) => {
            connection.release()

            if(!err) {
                res.send(`User with the Record ID: ${req.params.user_id} has been removed`)
            } else {
                console.log(err)
            }
        })
    })
})

//user felvétele
app.post('/users', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        const params = req.body
        

        connection.query('INSERT INTO users SET ?',params, (err, rows) => {
            connection.release()

            if(!err) {
                res.send(`User with the Record ID: ${params.user_id} has been added`)
            } else {
                console.log(err)
            }

        })

        console.log(req.body)
    })
})

//user frissítése
app.put('/users', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        const  {user_id, course_id, user_name, email, phone, password, first_name, last_name, mothers_name, address, birth_day} =req.body

        connection.query('UPDATE users SET course_id = ?, user_name = ?, email = ?, phone = ?, password = ?, first_name = ?, last_name = ?, mothers_name = ?, address = ?, birth_day = ? WHERE user_id = ?',
                        [course_id, user_name, email, phone, password, first_name, last_name, mothers_name, address, birth_day, user_id],
                        (err, rows) => {
            connection.release()

            if(!err) {
                res.send(`User with the Record ID: ${user_id} has been updated`)
            } else {
                console.log(err)
            }

        })

        console.log(req.body)
    })
})
app.put('/users/:user_id', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`connected as id ${connection.threadId}`);

        const user_id = req.params.user_id;
        const updateFields = req.body;

        // Először lekérjük az aktuális felhasználó adatait az adatbázisból
        connection.query('SELECT * FROM users WHERE user_id = ?', [user_id], (err, rows) => {
            if (err) {
                connection.release();
                console.log(err);
                res.status(500).send('Error retrieving user data');
                return;
            }

            if (rows.length === 0) {
                connection.release();
                res.status(404).send(`User with ID ${user_id} not found`);
                return;
            }

            const currentUserData = rows[0];

            // A kérésben kapott adatokat összefésüljük a meglévő adatokkal
            const updatedUserData = { ...currentUserData, ...updateFields };

            // A frissített adatokat tároljuk az adatbázisban
            connection.query('UPDATE users SET ? WHERE user_id = ?', [updatedUserData, user_id], (err, rows) => {
                connection.release();

                if (!err) {
                    res.send(`User with the Record ID: ${user_id} has been updated`);
                } else {
                    console.log(err);
                    res.status(500).send('Error updating user');
                }
            });
        });
    });
});

// airplanes tábla kilistázása
app.get('/airplanes', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('SELECT * FROM airplanes', (err, rows) => {
            connection.release()

            if(!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})

// airplane_id alapján airplane kilistázása
app.get('/airplanes/:airplane_id', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('SELECT * FROM airplanes WHERE airplane_id = ?',[req.params.airplane_id], (err, rows) => {
            connection.release()

            if(!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})

//airplane_id alapján airplane törlése
app.delete('/airplanes/:airplane_id', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('DELETE FROM airplanes WHERE airplane_id = ?',[req.params.airplane_id], (err, rows) => {
            connection.release()

            if(!err) {
                res.send(`Airplane with the Record ID: ${req.params.airplane_id} has been removed`)
            } else {
                console.log(err)
            }
        })
    })
})

//airplane felvétele
app.post('/airplanes', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        const params = req.body
        

        connection.query('INSERT INTO airplanes SET ?',params, (err, rows) => {
            connection.release()

            if(!err) {
                res.send(`Airplane with the Record ID: ${params.airplane_id} has been added`)
            } else {
                console.log(err)
            }

        })

        console.log(req.body)
    })
})

//airplane frissítése
app.put('/airplanes', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        const  {airplane_id, airplane_name, propulsion} =req.body

        connection.query('UPDATE airplanes SET airplane_name = ?, propulsion = ? WHERE airplane_id = ?',
                        [airplane_name, propulsion, airplane_id],
                        (err, rows) => {
            connection.release()

            if(!err) {
                res.send(`Airplane with the Record ID: ${airplane_id} has been updated`)
            } else {
                console.log(err)
            }

        })

        console.log(req.body)
    })
})

// courses tábla kilistázása
app.get('/courses', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('SELECT * FROM courses', (err, rows) => {
            connection.release()

            if(!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})

// course_id alapján course kilistázása
app.get('/courses/:course_id', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('SELECT * FROM courses WHERE course_id = ?',[req.params.course_id], (err, rows) => {
            connection.release()

            if(!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})

//airplane_id alapján course törlése
app.delete('/courses/:course_id', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('DELETE FROM courses WHERE course_id = ?',[req.params.course_id], (err, rows) => {
            connection.release()

            if(!err) {
                res.send(`Course with the Record ID: ${req.params.course_id} has been removed`)
            } else {
                console.log(err)
            }
        })
    })
})

//course felvétele
app.post('/courses', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        const params = req.body
        

        connection.query('INSERT INTO courses SET ?',params, (err, rows) => {
            connection.release()

            if(!err) {
                res.send(`Course with the Record ID: ${params.course_id} has been added`)
            } else {
                console.log(err)
            }

        })

        console.log(req.body)
    })
})

//airplane frissítése
app.put('/courses', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        const  {course_id, course_name, user_id, airplane_id, instructor, start_date, end_date, course_fee} =req.body

        connection.query('UPDATE courses SET course_name = ?, user_id = ?, airplane_id = ?, instructor = ?, start_date = ?, end_date = ?, course_fee = ? WHERE course_id = ?',
                        [course_name, user_id, airplane_id, instructor, start_date, end_date, course_fee, course_id],
                        (err, rows) => {
            connection.release()

            if(!err) {
                res.send(`Course with the Record ID: ${course_id} has been updated`)
            } else {
                console.log(err)
            }

        })

        console.log(req.body)
    })
})

// users_courses tábla kilistázása
app.get('/users_courses', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('SELECT * FROM users_courses', (err, rows) => {
            connection.release()

            if(!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})

//user_id és courses_id alapján users_courses kilistázása
app.get('/users_courses/:user_id/:course_id', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        const {user_id, course_id} = req.params

        connection.query('SELECT * FROM users_courses WHERE user_id = ? AND course_id = ? ',[user_id, course_id], (err, rows) => {
            connection.release()

            if(!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})

//user_id és courses_id alapján users_courses törlése
app.delete('/users_courses/:user_id/:course_id', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        const {user_id, course_id} = req.params

        connection.query('DELETE FROM users_courses WHERE user_id = ? AND course_id = ? ',[user_id, course_id], (err, rows) => {
            connection.release()

            if(!err) {
                res.send(`Course with the User ID: ${user_id} and Course ID: ${course_id} has been removed`)
            } else {
                console.log(err)
            }
        })
    })
})

//users_courses felvétele
app.post('/users_courses', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        const params = req.body
        

        connection.query('INSERT INTO users_courses SET ?',params, (err, rows) => {
            connection.release()

            if(!err) {
                res.send(`Course with the User ID: ${params.user_id} and Course ID: ${params.course_id} has been added`)
            } else {
                console.log(err)
            }

        })

        console.log(req.body)
    })
})


app.listen(port, () => console.log(`Listening on port ${port}`)) 