<?php
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$_SESSION = [];
session_destroy();

echo json_encode(["message" => "Logged out successfully"]);
?>