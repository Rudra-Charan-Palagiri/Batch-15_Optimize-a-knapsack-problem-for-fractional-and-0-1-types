# Automatic Knapsack Solver

This is a web application to solve **0/1 Knapsack** and **Fractional Knapsack** problems.
You can create multiple problems, add items, and solve them individually or all at once.

---

## Features

* Solve 0/1 Knapsack
* Solve Fractional Knapsack
* Add multiple problems
* Add and remove items
* Edit problem name and capacity
* Solve single problem
* Solve all problems
* Shows maximum profit and selected items

---

## Technologies Used

Frontend:

* React.js
* Axios
* CSS

Backend:

* Spring Boot
* Java
* REST API

---

## How to Run

### Frontend

```id="a1"
npm install
npm start
```

Runs on:

```id="a2"
http://localhost:3000
```

---

### Backend

```id="a3"
mvn spring-boot:run
```

Runs on:

```id="a4"
http://localhost:8080
```

---

## API Used

```id="a5"
POST /api/knapsack/solve
```

Example request:

```id="a6"
{
  "capacity": 50,
  "type": "ZERO_ONE",
  "items": [
    { "weight": 10, "value": 60 },
    { "weight": 20, "value": 100 }
  ]
}
```

---


---

## License

Free to use for learning and projects.
