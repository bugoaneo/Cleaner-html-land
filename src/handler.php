<?php
//	echo "<pre>";
//die(json_encode(array('info'=>$_POST['backfix'])));
	if (isset($_POST)) {
		$backfix = (bool)$_POST['backfix'];
		$jquery = (bool)$_POST['jquery'];
		$dtime = (bool)$_POST['dtime'];
		$link = $_POST['link'];
	}
	$filename = $_FILES['file']['name'];
	ob_start();
	if ($_FILES['file']['type'] !== 'text/html') {
		echo json_encode(
			array(
				'info' => 'only htm/html'
			)
		);
		die();
	}
    if ( 0 < $_FILES['file']['error'] ) {
        echo 'Error: ' . $_FILES['file']['error'] . '<br>';
    }
    else {
        if (move_uploaded_file($_FILES['file']['tmp_name'], '../uploads/' . $filename)) {
        	echo "Файл успешно загружен<br>";
        }

    }

	require('phpQuery.php');
	require('HtmlFormatter.php');
	$html = phpQuery::newDocumentFile('../uploads/' . $filename);

	$html['head']->find('script')->remove();
	$html->find('noscript')->remove();
	$html->find('style')->remove();
	$html->find('link')->remove();

	$html->find('script')->filter(function($i, $node) {
	  if ($node->getAttribute('src')) {
			$nodeTmp = pq($node);
			$nodeTmp->remove();
		}
		if (strpos($node->nodeValue, 'dtime') === false) {
			$node->nodeValue = '';
		}
	});

	$imgs = $html->find('img');

	foreach ($imgs as $img) {
		$pqLink = pq($img); //pq делает объект phpQuery
	//	$src[] = $pqLink->attr('src');
		$re = '/(.*\/(.*\/.*\.(png|jpg)))/';
		$subst = '$2';
		$new_src = preg_replace($re, $subst, $pqLink->attr('src'));
		$pqLink->attr('src', $new_src);
	}

	if ($backfix) {
			$html['head']->append('<script src="/js/script.js"></script>');
	}
	if ($jquery) {
		$html['head']->append('<script src="js/jquery-1.12.4.min.js"></script>');
	}
	if ($dtime) {
		$html['head']->append('<script src="js/dr-dtime.js"></script>');
	}

	$html['a']->attr('href', '');
	$html['img']->removeAttr('tppabs');
	$html['a']->removeAttr('tppabs');

	file_put_contents('../uploads/ready.html', $html);


	/*******************************************/

	$html2 = file_get_contents('../uploads/ready.html');
	$html2 = preg_replace('/<!--(.*?)-->/', '', $html2);
	$html2 = preg_replace('(<script type="text/javascript"></script>)', '', $html2);
	$html2 = preg_replace('(<script></script>)', '', $html2);
	$html2 = preg_replace('/href=""/', 'href="'.$link.'"', $html2);
	//htmlspecialchars_decode
	$html2 = preg_replace('/\n\n/', '', $html2);
	//$html2 = HtmlFormatter::format($html2);
	file_put_contents('../uploads/index.html', $html2);

	echo 'Обработка завершена. <a href="uploads/index.html" download>Скачать</a>';
	$info_for_download = ob_get_contents();
	ob_get_clean();

	echo json_encode(array(
		'info' => $info_for_download,
		'html_data' => $html2
	));
?>
