<?php
header('Content-Type: application/json');

// Abilita CORS se necessario
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Connessione al database
$conn = new mysqli("localhost", "username", "password", "database_name");

if ($conn->connect_error) {
    die(json_encode([
        'success' => false,
        'error' => "Connection failed: " . $conn->connect_error
    ]));
}

// Ricevi i dati dell'appuntamento
$data = json_decode(file_get_contents('php://input'), true);

// Validazione base dei dati
if (!isset($data['date']) || !isset($data['time']) || !isset($data['service'])) {
    die(json_encode([
        'success' => false,
        'error' => 'Dati mancanti'
    ]));
}

// Sanitizza i dati
$date = $conn->real_escape_string($data['date']);
$time = $conn->real_escape_string($data['time']);
$service = $conn->real_escape_string($data['service']);
$name = $conn->real_escape_string($data['name'] ?? '');
$phone = $conn->real_escape_string($data['phone'] ?? '');
$notes = $conn->real_escape_string($data['notes'] ?? '');

// Inserisci nel database
$sql = "INSERT INTO appointments (date, time, service, name, email, phone, notes, created_at) 
        VALUES ('$date', '$time', '$service', '$name', '$email', '$phone', '$notes', NOW())";

if ($conn->query($sql) === TRUE) {
    echo json_encode([
        'success' => true,
        'message' => 'Appuntamento salvato con successo'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => $conn->error
    ]);
}

$conn->close();
?>
