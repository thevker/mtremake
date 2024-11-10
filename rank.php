<?php
// 读取和存储分数的PHP脚本

// 保存分数
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $player_name = isset($_POST['player_name']) ? $_POST['player_name'] : '';
    $rank_point = isset($_POST['rank_point']) ? $_POST['rank_point'] : '0';
    
    if ($player_name && is_numeric($rank_point)) {
        $file_path = 'rank_' . $player_name . '.txt'; // 根据玩家名称动态生成文件名
        file_put_contents($file_path, $rank_point);
    }
}

// 读取分数
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $player_name = isset($_GET['player_name']) ? $_GET['player_name'] : '';
    if ($player_name) {
        $file_path = 'rank_' . $player_name . '.txt'; // 根据玩家名称动态生成文件名
        if (file_exists($file_path)) {
            echo file_get_contents($file_path);
        } else {
            echo "0";  // 如果文件不存在，返回 0
        }
    }
}
?>

//$file = 'rank.txt';

// 读取分数
//if ($_SERVER['REQUEST_METHOD'] === 'GET') {
//    if (file_exists($file)) {
//        echo file_get_contents($file);
//    } else {
//        echo "0";  // 如果文件不存在，返回 0
//    }
//}

// 保存分数
//if ($_SERVER['REQUEST_METHOD'] === 'POST') {
//    $rank_point = isset($_POST['rank_point']) ? $_POST['rank_point'] : '0';
//    if (is_numeric($rank_point)) {
//        file_put_contents($file, $rank_point);
//    }
//}
//?>
