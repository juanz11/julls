<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cupón gratis - JULLS</title>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #fdf5f7;
            color: #1e293b;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 16px;
        }
        .card {
            background: #fff;
            width: 100%;
            max-width: 420px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(191, 118, 145, 0.15);
            padding: 32px;
            border: 1px solid #f0dde3;
        }
        .logo {
            text-align: center;
            font-size: 28px;
            font-weight: 900;
            color: #bf7691;
            margin-bottom: 8px;
        }
        .subtitle {
            text-align: center;
            color: #64748b;
            font-size: 14px;
            margin-bottom: 24px;
        }
        .field {
            margin-bottom: 16px;
        }
        label {
            display: block;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #475569;
            margin-bottom: 6px;
        }
        input {
            width: 100%;
            padding: 12px 14px;
            border: 1px solid #f0dde3;
            border-radius: 12px;
            font-size: 15px;
            outline: none;
            transition: border-color 0.2s;
        }
        input:focus { border-color: #bf7691; }
        button {
            width: 100%;
            padding: 14px;
            border: none;
            border-radius: 12px;
            background: #bf7691;
            color: #fff;
            font-size: 16px;
            font-weight: 800;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
            margin-top: 8px;
        }
        button:hover { background: #a85f7d; }
        button:active { transform: scale(0.98); }
        .info {
            margin-top: 18px;
            font-size: 12px;
            color: #64748b;
            text-align: center;
            line-height: 1.4;
        }
        .error {
            color: #dc2626;
            font-size: 13px;
            margin-top: 4px;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo">JULLS</div>
        <p class="subtitle">Regala un cupón gratis por WhatsApp</p>

        <form id="cuponForm">
            <div class="field">
                <label for="nombre">Tu nombre</label>
                <input type="text" id="nombre" placeholder="Ej: María" required>
            </div>

            <div class="field">
                <label for="cedula">Cédula</label>
                <input type="text" id="cedula" placeholder="V-12.345.678" required>
            </div>

            <div class="field">
                <label for="numero">Tu número de teléfono</label>
                <input type="tel" id="numero" placeholder="0412-1234567" required>
            </div>

            <div class="field">
                <label for="nombre_destino">Nombre de la persona que recibirá el cupón</label>
                <input type="text" id="nombre_destino" placeholder="Ej: Juan" required>
            </div>

            <div class="field">
                <label for="destino">Número de la persona que recibirá el cupón</label>
                <input type="tel" id="destino" placeholder="0412-9876543" required>
            </div>

            <button type="submit">Enviar cupón por WhatsApp</button>
            <div class="error" id="error"></div>
        </form>

        <p class="info">Al enviar, se abrirá WhatsApp Web con el mensaje listo. Solo debes dar "Enviar" en la conversación.</p>
    </div>

    <script>
        function cleanPhone(value) {
            return value.replace(/\D/g, '');
        }

        function toInternational(num) {
            num = cleanPhone(num);
            if (num.startsWith('0')) {
                return '58' + num.slice(1);
            }
            if (num.startsWith('58')) {
                return num;
            }
            return num;
        }

        function generateCode() {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let code = '';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return 'JULLS-' + code;
        }

        document.getElementById('cuponForm').addEventListener('submit', function (e) {
            e.preventDefault();
            const errorEl = document.getElementById('error');
            errorEl.textContent = '';

            const nombre = document.getElementById('nombre').value.trim();
            const cedula = document.getElementById('cedula').value.trim();
            const numero = document.getElementById('numero').value.trim();
            const nombreDestino = document.getElementById('nombre_destino').value.trim();
            const destino = document.getElementById('destino').value.trim();

            if (!nombre || !cedula || !numero || !nombreDestino || !destino) {
                errorEl.textContent = 'Por favor completa todos los campos.';
                return;
            }

            const to = toInternational(destino);
            if (cleanPhone(to).length < 10) {
                errorEl.textContent = 'El número del destinatario no parece válido.';
                return;
            }

            const codigo = generateCode();
            const mensaje = `¡Hola ${nombreDestino}! Se te ha invitado un obsequio de parte de ${nombre}. 🍪✨\n\n` +
                            `Cupón: ${codigo}\n` +
                            `Cédula del remitente: ${cedula}\n` +
                            `Número del remitente: ${numero}\n\n` +
                            `Presenta este mensaje para canjearlo en JULLS.`;

            const url = `https://wa.me/${to}?text=${encodeURIComponent(mensaje)}`;
            window.open(url, '_blank');
        });
    </script>
</body>
</html>
