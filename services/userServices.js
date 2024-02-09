require('dotenv').config();
const Action = require('../module/actions')
const addOrUpdateAction = async (req, res) => {
    try {
        const { action, user } = req.body;
        var UserIsAvtive = ["saifi", "Genius", "AboMrim"];

        // التحقق من وجود المستخدم في المصفوفة
        if (!UserIsAvtive.includes(user)) {
            // إذا المستخدم غير موجود في المصفوفة، ارجع رسالة خطأ
            return res.status(400).json({ message: "User is not allowed to modify action" });
        }

        // تحديث السجل إذا وُجد، أو إنشاء واحد جديد إذا لم يُعثر على أي سجل
        const updatedAction = await Action.findOneAndUpdate(
            {}, // فلتر البحث (بحث عن أي سجل)
            { action, user }, // البيانات المُحدثة
            {
                new: true, // إرجاع السجل المُحدث
                upsert: true // إنشاء سجل جديد إذا لم يُعثر على أي سجل
            }
        );

        if (updatedAction) {
            // إرسال الرد مع السجل المُحدث أو المُنشأ
            return res.status(200).json({ message: "Action added or updated successfully", updatedAction });
        } else {
            // في حالة عدم نجاح العملية
            return res.status(400).json({ message: "Unable to add or update action" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error processing request" });
    }
};




module.exports = { addOrUpdateAction}