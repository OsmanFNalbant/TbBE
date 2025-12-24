import Feed from "../models/Feed.js"; // ✅

export const uploadImage = async (req, res) => {
  try {
    const { studentName, studentNumber, school } = req.body;

    if (!studentName || !studentNumber) {
      return res.status(400).json({ error: "Ad ve numara zorunlu" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Dosya yok" });
    }

    const feedItem = new Feed({
      image: req.file.path,
      studentName,
      studentNumber,
      school,
    });

    await feedItem.save();
    res.json(feedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};
