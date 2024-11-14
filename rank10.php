<?php

// 检查请求方法
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    // 使用字符串的方式获取玩家名称数组 input
    $au_id = isset($_GET['au_id']) ? $_GET['au_id'] : "";
    $rank_point = isset($_GET['rank_point']) ? (int)$_GET['rank_point'] : 0;
    $player_name = isset($_GET['player_name']) ? $_GET['player_name'] : "";

    // 将玩家名称转换为十六进制，确保使用UTF-8编码
    $player_name_hex = bin2hex(mb_convert_encoding($player_name, 'UTF-8'));

    // 数据将保存到此文件
    $filePath = 'rank.txt';

    // 先初始化总分值为请求中的 rank_point
    $totalRankPoint = $rank_point; 

    // 检查文件是否存在并读取现有的分数
    $existingData = "";
    if (file_exists($filePath)) {
        $existingData = file_get_contents($filePath);
    }

    // 更新或添加分数
    // 如果玩家已存在，更新分数；否则，添加新玩家
    $lines = explode("\n", trim($existingData));
    $found = false;

    foreach ($lines as &$line) {
        if (strpos($line, "$au_id") !== false) {
            // 已存在的玩家，更新分数
            $line = sprintf("%s rank_point=%d %s", $au_id, $totalRankPoint, $player_name_hex);
            $found = true;
            break;
        }
    }

    if (!$found) {
        // 如果没有找到玩家，添加新的行
        $lines[] = sprintf("%s rank_point=%d %s", $au_id, $totalRankPoint, $player_name_hex);
    }

    // 将数据写入文件，确保数据为UTF-8编码
    $dataToSave = implode("\n", $lines);
    
    // 确保以UTF-8编码写入文件
    if (file_put_contents($filePath, mb_convert_encoding($dataToSave, 'UTF-8')) !== false) {
        echo "数据保存成功，$au_id $rank_point $player_name_hex";
    } else {
        echo "数据保存失败";
    }
}
?>