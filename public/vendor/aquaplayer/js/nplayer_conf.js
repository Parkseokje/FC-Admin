﻿var NPLAYER_VERSION = '2,0,329,4576';
var NPLAYER_SETUP_URL = 'http://dist.cdnetworks.co.kr/cdndist/aquanplayer/AquaNPlayer_2.0.329.4576_1027_proxy_1.0.0.27.exe';
// var NPLAYER_SETUP_URL = 'http://dist2.dwa.cdnetworks.com/cdndist/aquanplayer/AquaNPlayer_2.0.329.4576_1027_proxy_1.0.0.27.exe';
var NPLAYER_OSX_SETUP_URL = 'http://dist2.dwa.cdnetworks.com/cdndist/aquanplayer/AquaNAgent_1.0.0.36.dmg';
var AQUAWEBAGENT_SETUP_URL = 'http://cdntech.cdnetworks.co.kr/public/bhoh/html5/setup/AquaNWebAgent_1.0.0.1.exe';
var AX_VERSION = '1,0,2,7';
var PROXY_WIN_VERSION = '1,0,0,27';
var PROXY_OSX_VERSION = '1,0,0,36';
var NPLAYER_GUARD_DB_URL = 'http://dist2.dwa.cdnetworks.com/cdndist/aquanplayer/nPlayerGuard.xml';
var NPLAYER_USE_DSHOW = false;
var NPLAYER_INSTALL_MSG = '<a href=\'' + NPLAYER_SETUP_URL + '\'><img src=\'images/download.png\' border=\'0\' /></a><p>동영상을 시청하려면 <span style=\'color:#00ff00\'>AquaNPlayer</span> 를 설치하여 주십시오.</p><p>설치에 문제가 있으면 <a style=\'color:#ff4f4f;text-decoration:none\' href=\'' + NPLAYER_SETUP_URL + '\'>수동 설치 프로그램을 내려받아</a> 설치하여 주십시오.</p>';
var NPLAYER_DUP_MSG = '동일 ID로 강의시청중에 있어 종료합니다.';
var NPLAYER_PLAYER_STOP_REQUEST_MSG = '####강의 시청으로 인하여 현재 플레이어를 종료합니다.####';
var PROXY_CHECK_FAIL = '웹 에이젼트가 실행되지 않았습니다. 잠시 후 다시 실행 바랍니다.';
var PROXY_ERROR_UNKONWN = 550;
var PROXY_ERROR_ACTIVE_NOT_CLEARED = 551;
var PROXY_ERROR_AUTH_NOT_FOUND = 552;
var PROXY_ERROR_AUTH_HTTP_403 = 503;
var PROXY_ERROR_AUTH_HTTP_404 = 504;
var PROXY_ERROR_BLOCKED_HTTP = 555;
var PROXY_ERROR_FORCE_STOP = 512;
var PROXY_ERROR_DUP_CHECKED = 513;
var PROXY_ERROR_CAPTURE_ENABLED = 514;
var STR_PPROXY_NOT_FOUND = 'Agent가 종료되어 비디오를 재생할 수 없습니다.';
var STR_PPROXY_ERROR_BLOCKED_HTTP = '재생 정보가 차단되었습니다.';
var STR_PROXY_ERROR_UNKONWN = '알 수 없는 오류로 인하여 미디어 요청이 취소되었습니다.';
var STR_PPROXY_ERROR_AUTH_NOT_FOUND = '인증 정보가 설정되지 않았습니다.';
var STR_PPROXY_ERROR_AUTH_HTTP_403 = '미디어 인증에 실패하였습니다.';
var STR_PPROXY_ERROR_AUTH_HTTP_404 = '파일을 찾을 수 없습니다.';
var STR_PPROXY_ERROR_BLOCKED_HTTP = '재생 정보가 차단되었습니다.';
var STR_PROXY_ERROR_ACTIVE_NOT_CLEARED = '재생 정보가 존재하여 미디오 요청이 취소되었습니다.';
var STR_PROXY_ERROR_CAPTURE_ENABLED = '녹화툴이 발견되어 재생을 중지합니다.';
