document.getElementById('initTime').textContent = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

const HuggingFace_API_Key = "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";
let Vector_Database = [];
let Database_Loaded = false;
let Chat_History = [];

const Selfawareness_System_Prompt = "คุณเป็น Chatbot ผู้ช่วยอัจฉริยะชื่อ Luvvy ของภาควิศวกรรมคอมพิวเตอร์ สาขาวิศวกรรมระบบไอโอทีและสารสนเทศ (IoTE) สจล. คุณสามารถตอบคำถามเกี่ยวกับหลักสูตรและข้อมูลภาควิชาได้ ตอบด้วยความสุภาพ เป็นมิตร มีอีโมจิประกอบ และห้ามตอบเป็นภาษาจีนเป็นอันขาด 你是一个泰国大学计算机工程系的专业AI助手。绝对规则：你必须**只使用泰语 (Thai)** 进行回复。绝对禁止输出中文字符。";

Chat_History.push({
    role: "system",
    content: Selfawareness_System_Prompt
});

const Message_Element_ID = document.getElementById('messages');
const Input_Element_ID = document.getElementById('msgInput');

Module.onRuntimeInitialized = async function () {
    console.log("WASM โหลดเสร็จแล้ว! กำลังโหลดฐานข้อมูล...");
    await load_Chatbot_Database();
};

async function load_Chatbot_Database() {
    try {
        const Database_Response = await fetch('Chatbot_Database_Vectors_1_0_1.json');
        Vector_Database = await Database_Response.json();
        Database_Loaded = true;
        console.log("ฐานข้อมูลเวกเตอร์โหลดเสร็จแล้ว");
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดฐานข้อมูลเวกเตอร์:", error);
    }
}

function scrollToBottom() {
    setTimeout(() => {
        Message_Element_ID.scrollTop = Message_Element_ID.scrollHeight;
    }, 100);
}

function Append_User_Message(Message) {
    const Current_Time = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const User_Message_Html = `
        <div class="msg-row user">
            <div class="msg-avatar user-av">ME</div>
            <div class="msg-group">
                <div class="bubble user">${Message}</div>
                <span class="msg-time">${Current_Time}</span>
            </div>
        </div>
    `;
    Message_Element_ID.insertAdjacentHTML('beforeend', User_Message_Html);
    scrollToBottom();
}

function Append_Bot_Message(Message) {
    const Current_Time = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const Formatted_Bot_Message = Message.replace(/\n/g, "<br>");
    const Bot_Message_Html = `
        <div class="msg-row bot">
            <div class="msg-avatar"><img src="luvvy.jpg" alt="Luvvy" onerror="this.outerHTML='🤖'"></div>
            <div class="msg-group">
                <span class="sender-name">Luvvy IoTE KMITL</span>
                <div class="bubble bot">${Formatted_Bot_Message}</div>
                <span class="msg-time">${Current_Time}</span>
            </div>
        </div>
    `;
    Message_Element_ID.insertAdjacentHTML('beforeend', Bot_Message_Html);
    scrollToBottom();
}

function Show_Typing_Animation() {
    const Show_Typing_Html = `
        <div class="msg-row bot" id="Typing_Indicator">
            <div class="msg-avatar"><img src="luvvy.jpg" alt="Luvvy" onerror="this.outerHTML='🤖'"></div>
            <div class="msg-group">
                <span class="sender-name">Luvvy IoTE KMITL</span>
                <div class="bubble bot typing">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        </div>
    `;
    Message_Element_ID.insertAdjacentHTML('beforeend', Show_Typing_Html);
    scrollToBottom();
}

function Remove_Typing_Animation() {
    const Element_ID = document.getElementById("Typing_Indicator");
    if (Element_ID) Element_ID.remove();
}

async function Get_Embedding_Question(Context) {
    const Embedding_Response = await fetch('http://localhost:3000/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: Context })
    });

    if (!Embedding_Response.ok) throw new Error("Local Backend Embedding Error");

    const Embedding_Data = await Embedding_Response.json();
    return new Float32Array(Embedding_Data.embedding);
}

function Cosine_Similarity(Vector_A, Vector_B) {
    const Length = Vector_A.length;
    const Bytes_Per_Element = Vector_A.BYTES_PER_ELEMENT;
    const Ptr_A = Module._Wasm_malloc(Length * Bytes_Per_Element);
    const Ptr_B = Module._Wasm_malloc(Length * Bytes_Per_Element);

    let Wasm_Memory_View;
    if (typeof HEAPF32 !== 'undefined') {
        Wasm_Memory_View = HEAPF32;
    } else if (typeof Module.HEAPF32 !== 'undefined') {
        Wasm_Memory_View = Module.HEAPF32;
    } else {
        const Memory_Buffer = Module.wasmMemory ? Module.wasmMemory.buffer : Module.asm.memory.buffer;
        Wasm_Memory_View = new Float32Array(Memory_Buffer);
    }

    Wasm_Memory_View.set(Vector_A, Ptr_A / Bytes_Per_Element);
    Wasm_Memory_View.set(Vector_B, Ptr_B / Bytes_Per_Element);

    const Vector_Result = Module._Cosine_Similarity_Check(Ptr_A, Ptr_B, Length);

    Module._Wasm_free(Ptr_A);
    Module._Wasm_free(Ptr_B);

    return Vector_Result;
}

async function sendMsg() {
    const Prompt_Value = Input_Element_ID.value.trim();

    if (!Prompt_Value) return alert("กรุณาพิมพ์คำถามก่อนกดปุ่ม!");
    if (!Database_Loaded) return alert("ฐานข้อมูลยังไม่พร้อมใช้งาน กรุณารอสักครู่...");

    Append_User_Message(Prompt_Value);
    Input_Element_ID.value = "";

    Show_Typing_Animation();

    try {
        const Question_Vector = await Get_Embedding_Question(Prompt_Value);

        let Best_Match = null;
        let Highest_Similarity = -1;

        for (let doc of Vector_Database) {
            const vecData = doc.Vector || doc.vector || doc.embedding;
            if (!vecData) continue;

            const Doc_Vector = new Float32Array(vecData);
            const Similarity_Score = Cosine_Similarity(Question_Vector, Doc_Vector);

            if (Similarity_Score > Highest_Similarity) {
                Highest_Similarity = Similarity_Score;
                Best_Match = doc;
            }
        }

        console.log(`ความคล้ายสูงสุดที่พบ: ${Highest_Similarity.toFixed(4)}`);

        let Augmented_Prompt = Prompt_Value;

        if (Highest_Similarity > 0.6 && Best_Match) {
            console.log("พบข้อมูลที่เกี่ยวข้องในฐานข้อมูล:", Best_Match);
            Augmented_Prompt = `[บริบทอ้างอิงจากภาควิชา: ${Best_Match.original_answer || Best_Match.content}]\n\nคำถามของผู้ใช้: ${Prompt_Value}`;
        }

        Chat_History.push({
            role: "user",
            content: Augmented_Prompt
        });

        let Sending_Retires_Quota = 3;
        let Attempt_Count = 0;
        let Vaild_Response = false;
        let Bot_Context_Reply = "";

        while (Attempt_Count < Sending_Retires_Quota && !Vaild_Response) {
            let Retries_Chat_History = [...Chat_History];

            if (Attempt_Count > 0) {
                let Last_Chat_Index = Retries_Chat_History.length - 1;
                Retries_Chat_History[Last_Chat_Index].content += "\n\n(คำเตือนจากระบบ: ห้ามใช้ภาษาจีนหรือตัวอักษรจีนในการตอบเด็ดขาด! กรุณาตอบเป็นภาษาไทยเท่านั้น)";
            }

            const Response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: Retries_Chat_History,
                    temperature: 0.6 + (Attempt_Count * 0.1)
                })
            });

            if (!Response.ok) throw new Error("Local Backend Chat Error");
            const data = await Response.json();

            Bot_Context_Reply = data.reply;

            if (Chinese_Letter_Filter(Bot_Context_Reply)) {
                Attempt_Count++;
                console.warn(`ตรวจพบภาษาจีน (ครั้งที่ ${Attempt_Count}) กำลังสั่งให้ AI คิดใหม่...`);
            } else {
                Vaild_Response = true;

            }
        }

        Remove_Typing_Animation();

        if (!Vaild_Response) {
            Chat_History.pop();
            Append_Bot_Message(`<span style="color: red;">ไม่สามารถให้คำตอบที่ถูกต้องได้หลังจากหลายครั้งที่พยายาม. กรุณาลองใหม่อีกครั้งในภายหลัง.</span>`);
            return;
        } else {
            Chat_History.push({
                role: "assistant",
                content: Bot_Context_Reply
            });
            Append_Bot_Message(Bot_Context_Reply);
        }

        scrollToBottom();

    }
    catch (error) {
        Remove_Typing_Animation();
        Chat_History.pop();
        Append_Bot_Message(`<span style="color: red;">เกิดข้อผิดพลาด: ${error.message}</span>`);
        scrollToBottom();
    }
}

function Chinese_Letter_Filter(Context) {
    const Chinese_Char_Unicode_Range = /[\u4e00-\u9fff]/;
    return Chinese_Char_Unicode_Range.test(Context);
}