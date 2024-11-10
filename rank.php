<?php
$file = 'rank.txt';

// 读取分数
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($file)) {
        echo file_get_contents($file);
    } else {
        echo "0";  // 如果文件不存在，返回 0
    }
}

// 保存分数
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rank_point = isset($_POST['rank_point']) ? $_POST['rank_point'] : '0';
    if (is_numeric($rank_point)) {
        file_put_contents($file, $rank_point);
    }
}
?>