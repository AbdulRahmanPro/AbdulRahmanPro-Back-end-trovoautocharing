import websocket
import json

def on_message(ws, message):
    try:
        # تحويل الرسالة من JSON إلى Dictionary
        data = json.loads(message)
        print("Data received:", data)
    except json.JSONDecodeError:
        # تجاهل الرسائل التي لا يمكن تحليلها كـ JSON
        pass

def on_error(ws, error):
    print("Error occurred:", error)

def on_close(ws, close_status_code, close_msg):
    print("Connection closed")

def on_open(ws):
    print("Connection opened")
    # إرسال رسالة تحية إلى السيرفر إذا لزم الأمر
    ws.send("Hello, server!")

if __name__ == "__main__":
    # ملاحظة: إزالة enableTrace لتجنب الطباعة التفصيلية
    ws_url = "wss://161.35.221.168/"  # تأكد من استبدال هذا بالمسار الصحيح
    ws = websocket.WebSocketApp(ws_url,
                                on_open=on_open,
                                on_message=on_message,
                                on_error=on_error,
                                on_close=on_close)

    ws.run_forever()
