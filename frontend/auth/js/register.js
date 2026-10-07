document.querySelectorAll(".password-toggle").forEach(button => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.passwordTarget);

        if (!input) return;

        const show = input.type === "password";

        input.type = show ? "text" : "password";
        button.textContent = show ? "🙈" : "👁";
        button.setAttribute("aria-label", show ? "Hide password" : "Show password");
        button.setAttribute("aria-pressed", String(show));
    });
});

const form=document.querySelector("#register-form"),message=document.querySelector("#register-message");
const setMessage=m=>{if(message)message.textContent=m};
form?.addEventListener("submit",async e=>{
e.preventDefault();
const f=new FormData(form),name=f.get("name").trim(),email=f.get("email").trim().toLowerCase(),phone=f.get("phone").trim(),password=f.get("password"),confirmPassword=f.get("confirmPassword");
if(!name||!email||!password)return setMessage("Name, email and password are required.");
if(password.length<6)return setMessage("Password must be at least 6 characters.");
if(password!==confirmPassword)return setMessage("Passwords do not match.");
setMessage("Creating account...");
try{
const r=await fetch("http://localhost:5000/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,phone,password})});
const result=await r.json();
if(!r.ok)throw new Error(result.message||"Account creation failed.");
window.location.href="/auth/pages/login.html?registered=1";
}catch(error){console.error("Registration error:",error);setMessage(error.message||"Unable to create account.")}
});
