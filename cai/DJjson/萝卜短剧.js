var rule = {
author: '小可乐/240601/第一版',
title: '萝卜短剧',
类型: '影视',
host: 'https://cj.lbbb.cc',
hostJs: '',
headers: {'User-Agent': 'MOBILE_UA'},
编码: 'utf-8',
timeout: 5000,

homeUrl: '/index.php/vod/show/id/42.html',
url: '/index.php/vod/show/fyfilter.html',
filter_url: '{{fl.area}}{{fl.by}}{{fl.class}}/id/{{fl.cateId}}{{fl.lang}}{{fl.letter}}/page/fypage{{fl.year}}',
detailUrl: '',
searchUrl: '/index.php/vod/search/page/fypage/wd/**.html',
searchable: 1, 
quickSearch: 1, 
filterable: 1, 

class_name: '短剧',
class_url: '42',
filter_def: {42: {cateId: '42'}},

play_parse: true,
parse_url: '',
lazy: `js:
var kcode = JSON.parse(request(input).match(/var player_.*?=(.*?)</)[1]);
var kurl = kcode.url;
if (/m3u8|mp4/.test(kurl)) {
input = { jx: 0, parse: 0, url: kurl }
} else {
input = { jx: 0, parse: 1, url: kurl }
}`,

limit: 9,
double: false,
推荐: '*',
一级: `js:
let klist=pdfa(request(input),'body&&.module-item:has(.module-item-note)');
let k=[];
klist.forEach(it=>{
    k.push({
        title: pdfh(it,'a&&title'),
        pic_url: 'https://cj.lbbb.cc'+pdfh(it,'img&&data-original'),
        desc: '✨集多推荐✨'+pdfh(it,'.module-item-note&&Text'),
        url: pdfh(it,'a&&href'),    
        content: '',    
    })
});
setResult(k)
`,
二级: {
//名称;类型
title: 'h1&&Text;.module-info-tag-link:eq(2)&&Text',
//图片
img: '.module-info-poster&&img&&data-original',
//主要描述;年份;地区;演员;导演
desc: '.module-info-item:eq(-2)&&Text;.module-info-tag-link:eq(0)&&Text;.module-info-tag-link:eq(1)&&Text;.module-info-item-content:eq(1)&&Text;.module-info-item-content:eq(0)&&Text',
//简介
content: '.show-desc&&Text',
//线路数组
tabs: '.tab-item',
//线路标题
tab_text: 'body--small&&Text',
//播放数组 选集列表
lists: '.module-play-list:eq(#id)&&a',
//选集标题
list_text: 'body&&Text',
//选集链接
list_url: 'a&&href',
//链接处理
list_url_prefix: ''
},
搜索: '.module-card-item-poster;img&&alt;*;*;*',

filter: {
"42":[
{"key":"year","name":"时间","value":[{"n":"全部","v":""},{"n":"2024","v":"/year/2024"},{"n":"2023","v":"/year/2023"},{"n":"2022","v":"/year/2022"}]},
{"key":"letter","name":"字母","value":[{"n":"全部","v":""},{"n":"A","v":"/letter/A"},{"n":"B","v":"/letter/B"},{"n":"C","v":"/letter/C"},{"n":"D","v":"/letter/D"},{"n":"E","v":"/letter/E"},{"n":"F","v":"/letter/F"},{"n":"G","v":"/letter/G"},{"n":"H","v":"/letter/H"},{"n":"I","v":"/letter/I"},{"n":"J","v":"/letter/J"},{"n":"K","v":"/letter/K"},{"n":"L","v":"/letter/L"},{"n":"M","v":"/letter/M"},{"n":"N","v":"/letter/N"},{"n":"O","v":"/letter/O"},{"n":"P","v":"/letter/P"},{"n":"Q","v":"/letter/Q"},{"n":"R","v":"/letter/R"},{"n":"S","v":"/letter/S"},{"n":"T","v":"/letter/T"},{"n":"U","v":"/letter/U"},{"n":"V","v":"/letter/V"},{"n":"W","v":"/letter/W"},{"n":"X","v":"/letter/X"},{"n":"Y","v":"/letter/Y"},{"n":"Z","v":"/letter/Z"},{"n":"0-9","v":"/letter/0-9"}]},
{"key":"by","name":"排序","value":[{"n":"时间","v":"/by/time"},{"n":"人气","v":"/by/hits"},{"n":"评分","v":"/by/score"}]}
]
}
}