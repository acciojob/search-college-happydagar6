const express = require("express");
const app = express();
const { collegeModel } = require("./connector");

// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.status(200).send("HELLO WORLD");
});

// solution starts

app.get('/findColleges', async (req, res) => {
  try {
    const query = {};
    const { name, state, city, minPackage, maxFees, course, exam } = req.query;

    // 1. Text Filters (Case-Insensitive Regex)
    if (name) query.name = { $regex: name, $options: "i" };
    if (state) query.state = { $regex: state, $options: "i" };
    if (city) query.city = { $regex: city, $options: "i" };
    if (course) query.course = { $regex: course, $options: "i" };
    if (exam) query.exam = { $regex: exam, $options: "i" }; // Works for arrays too in MongoDB

    // 2. Numeric Filters (Invalid handling: only positive numbers are valid)
    if (minPackage) {
      const min = Number(minPackage);
      if (!isNaN(min) && min > 0) {
        query.minPackage = { $gte: min }; // Greater than or equal to
      }
    }

    if (maxFees) {
      const max = Number(maxFees);
      if (!isNaN(max) && max > 0) {
        query.maxFees = { $lte: max }; // Less than or equal to
      }
    }

    // 3. Query the Database
    const colleges = await collegeModel.find(query);

    // 4. Format the output JSON strictly according to the required key order
    const formattedColleges = colleges.map(college => ({
      name: college.name,
      city: college.city,
      state: college.state,
      exam: college.exam,
      course: college.course,
      maxFees: college.maxFees,
      minPackage: college.minPackage
    }));

    // 5. Send the exact response
    res.status(200).json(formattedColleges);

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// solution end

module.exports = { app };