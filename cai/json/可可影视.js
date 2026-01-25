/*
title: '可可影视', author: '小可乐/v5.10.1'
作品只限于个人学习和测试使用，禁止传播商用
ext参数标准格式:
"ext": {
    "host": "https://www.kkys01.com",
    "tabsDeal": "¥准:4K(高峰不卡),蓝光7@超清1>蓝光3>蓝光加速@超清1>>独家&蓝光加速>>电影天堂"
}
或者直接删除ext行，用默认配置
ext各参数说明：
host: 站点域名,空值或不写参数，用内置默认站点域名
tabsDeal: 线路处理，包含线路删除，线路排序，线路改名，优先级从高到低，参数格式"删除@排序@改名"，如："tabsDeal": "4K(高峰不卡),蓝光7@超清1>蓝光3>蓝光加速@超清1>>独家&蓝光加速>>电影天堂"，线路删除默认是模糊匹配模式，加了'¥准:'变为精准匹配模式：模糊匹配只要线路名含有删除词，该线路就会被删除，精准匹配要线路名和删除词一样才会删除。如只需线路排序可写成"@超清1>蓝光3>蓝光加速"，@分隔符号不能丢，线路不需处理，此参数可不写
这两参数都可以不写
*/
import {Crypto, load} from 'assets://js/lib/cat.js';

const MOBILE_UA = "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36";
var def_header = {'User-Agent': MOBILE_UA};
var cachedPlayUrls = {};
var HOST;

var kparam = {
    headers: def_header,
    pagecount: 0
};

async function init(cfg) {
    try {
        HOST = cfg.ext?.host?.trim().replace(/\/$/,'') ||  atob('aHR0cHM6Ly93d3cua2t5czAxLmNvbQ==');
        kparam.headers['Referer'] = HOST;
        kparam.tabsDeal = cfg.ext?.tabsDeal?.trim() || '';
        try {
            let html = await request(HOST);
            if (!html) {throw new Error('图片前缀路径页请求失败');}
            let scriptMatches = Array.from(html.matchAll(/script src="(.*?)"/g));           
            if (!scriptMatches.length) {throw new Error('未匹配到任何script标签');}
            let img_url = scriptMatches.find(it => { return it[1]?.includes('rdul.js'); })?.[1] || '';
            if (!img_url) {throw new Error('未匹配到含"rdul.js"的script标签src属性');}
            img_url = img_url.startsWith('http') ? img_url : `${HOST}/${img_url.replace(/^\//, '')}`;
            let img_html = await request(img_url);
            if (!img_html) {throw new Error('请求目标script内容失败');}
            kparam.img_host = img_html.match(/'(.*?)'/)?.[1] || '';
            if (!kparam.img_host) {throw new Error('未从script内容中提取到图片前缀');}
        } catch (e) {
            console.error('获取图片前缀失败：', error.message);
            kparam.img_host = 'err';
        }
    } catch (e) {
        console.error('初始化参数失败：', error.message);
    }
};

async function home(filter) {
    const classes = [{"type_name": "电影", "type_id": "1"},{"type_name": "剧集", "type_id": "2"},{"type_name": "综艺", "type_id": "4"},{"type_name": "动漫", "type_id": "3"},{"type_name": "短剧", "type_id": "6"}];
    const filters = {
        "1": [{"key":"class","name":"类型","value":[{"n":"全部","v":""},{"n":"Netflix","v":"NETFLIX"},{"n":"剧情","v":"剧情"},{"n":"喜剧","v":"喜剧"},{"n":"动作","v":"动作"},{"n":"爱情","v":"爱情"},{"n":"恐怖","v":"恐怖"},{"n":"惊悚","v":"惊悚"},{"n":"犯罪","v":"犯罪"},{"n":"科幻","v":"科幻"},{"n":"悬疑","v":"悬疑"},{"n":"奇幻","v":"奇幻"},{"n":"冒险","v":"冒险"},{"n":"战争","v":"战争"},{"n":"历史","v":"历史"},{"n":"古装","v":"古装"},{"n":"家庭","v":"家庭"},{"n":"传记","v":"传记"},{"n":"武侠","v":"武侠"},{"n":"歌舞","v":"歌舞"},{"n":"短片","v":"短片"},{"n":"动画","v":"动画"},{"n":"儿童","v":"儿童"},{"n":"职场","v":"职场"}]},{"key":"area","name":"地区","value":[{"n":"全部","v":""},{"n":"大陆","v":"中国大陆"},{"n":"香港","v":"中国香港"},{"n":"台湾","v":"中国台湾"},{"n":"美国","v":"美国"},{"n":"日本","v":"日本"},{"n":"韩国","v":"韩国"},{"n":"英国","v":"英国"},{"n":"法国","v":"法国"},{"n":"德国","v":"德国"},{"n":"印度","v":"印度"},{"n":"泰国","v":"泰国"},{"n":"丹麦","v":"丹麦"},{"n":"瑞典","v":"瑞典"},{"n":"巴西","v":"巴西"},{"n":"加拿大","v":"加拿大"},{"n":"俄罗斯","v":"俄罗斯"},{"n":"意大利","v":"意大利"},{"n":"比利时","v":"比利时"},{"n":"爱尔兰","v":"爱尔兰"},{"n":"西班牙","v":"西班牙"},{"n":"澳大利亚","v":"澳大利亚"},{"n":"其他","v":"其他"}]},{"key":"lang","name":"语言","value":[{"n":"全部","v":""},{"n":"国语","v":"国语"},{"n":"粤语","v":"粤语"},{"n":"英语","v":"英语"},{"n":"日语","v":"日语"},{"n":"韩语","v":"韩语"},{"n":"法语","v":"法语"},{"n":"其他","v":"其他"}]},{"key":"year","name":"年份","value":[{"n":"全部","v":""},{"n":"2025","v":"2025"},{"n":"2024","v":"2024"},{"n":"2023","v":"2023"},{"n":"2022","v":"2022"},{"n":"2021","v":"2021"},{"n":"2020","v":"2020"},{"n":"10年代","v":"2010_2019"},{"n":"00年代","v":"2000_2009"},{"n":"90年代","v":"1990_1999"},{"n":"80年代","v":"1980_1989"},{"n":"更早","v":"0_1979"}]},{"key":"by","name":"排序","value":[{"n":"综合","v":"1"},{"n":"最新","v":"2"},{"n":"最热","v":"3"},{"n":"评分","v":"4"}]}],
        "2": [{"key":"class","name":"类型","value":[{"n":"全部","v":""},{"n":"Netflix","v":"Netflix"},{"n":"剧情","v":"剧情"},{"n":"爱情","v":"爱情"},{"n":"喜剧","v":"喜剧"},{"n":"犯罪","v":"犯罪"},{"n":"悬疑","v":"悬疑"},{"n":"古装","v":"古装"},{"n":"动作","v":"动作"},{"n":"家庭","v":"家庭"},{"n":"惊悚","v":"惊悚"},{"n":"奇幻","v":"奇幻"},{"n":"美剧","v":"美剧"},{"n":"科幻","v":"科幻"},{"n":"历史","v":"历史"},{"n":"战争","v":"战争"},{"n":"韩剧","v":"韩剧"},{"n":"武侠","v":"武侠"},{"n":"言情","v":"言情"},{"n":"恐怖","v":"恐怖"},{"n":"冒险","v":"冒险"},{"n":"都市","v":"都市"},{"n":"职场","v":"职场"}]},{"key":"area","name":"地区","value":[{"n":"地区","v":""},{"n":"大陆","v":"中国大陆"},{"n":"香港","v":"中国香港"},{"n":"韩国","v":"韩国"},{"n":"美国","v":"美国"},{"n":"日本","v":"日本"},{"n":"法国","v":"法国"},{"n":"英国","v":"英国"},{"n":"德国","v":"德国"},{"n":"台湾","v":"中国台湾"},{"n":"泰国","v":"泰国"},{"n":"印度","v":"印度"},{"n":"其他","v":"其他"}]},{"key":"lang","name":"语言","value":[{"n":"全部","v":""},{"n":"国语","v":"国语"},{"n":"粤语","v":"粤语"},{"n":"英语","v":"英语"},{"n":"日语","v":"日语"},{"n":"韩语","v":"韩语"},{"n":"法语","v":"法语"},{"n":"其他","v":"其他"}]},{"key":"year","name":"年份","value":[{"n":"全部","v":""},{"n":"2025","v":"2025"},{"n":"2024","v":"2024"},{"n":"2023","v":"2023"},{"n":"2022","v":"2022"},{"n":"2021","v":"2021"},{"n":"2020","v":"2020"},{"n":"10年代","v":"2010_2019"},{"n":"00年代","v":"2000_2009"},{"n":"90年代","v":"1990_1999"},{"n":"80年代","v":"1980_1989"},{"n":"更早","v":"0_1979"}]},{"key":"by","name":"排序","value":[{"n":"综合","v":"1"},{"n":"最新","v":"2"},{"n":"最热","v":"3"},{"n":"评分","v":"4"}]}],
        "4": [{"key":"class","name":"类型","value":[{"n":"全部","v":""},{"n":"纪录","v":"纪录"},{"n":"真人秀","v":"真人秀"},{"n":"记录","v":"记录"},{"n":"脱口秀","v":"脱口秀"},{"n":"剧情","v":"剧情"},{"n":"历史","v":"历史"},{"n":"喜剧","v":"喜剧"},{"n":"传记","v":"传记"},{"n":"相声","v":"相声"},{"n":"节目","v":"节目"},{"n":"歌舞","v":"歌舞"},{"n":"冒险","v":"冒险"},{"n":"运动","v":"运动"},{"n":"Season","v":"Season"},{"n":"犯罪","v":"犯罪"},{"n":"短片","v":"短片"},{"n":"搞笑","v":"搞笑"},{"n":"晚会","v":"晚会"}]},{"key":"area","name":"地区","value":[{"n":"全部","v":""},{"n":"大陆","v":"中国大陆"},{"n":"香港","v":"中国香港"},{"n":"台湾","v":"中国台湾"},{"n":"美国","v":"美国"},{"n":"日本","v":"日本"},{"n":"韩国","v":"韩国"},{"n":"其他","v":"其他"}]},{"key":"lang","name":"语言","value":[{"n":"全部","v":""},{"n":"国语","v":"国语"},{"n":"粤语","v":"粤语"},{"n":"英语","v":"英语"},{"n":"日语","v":"日语"},{"n":"韩语","v":"韩语"},{"n":"法语","v":"法语"},{"n":"其他","v":"其他"}]},{"key":"year","name":"年份","value":[{"n":"全部","v":""},{"n":"2025","v":"2025"},{"n":"2024","v":"2024"},{"n":"2023","v":"2023"},{"n":"2022","v":"2022"},{"n":"2021","v":"2021"},{"n":"2020","v":"2020"},{"n":"10年代","v":"2010_2019"},{"n":"00年代","v":"2000_2009"},{"n":"90年代","v":"1990_1999"},{"n":"80年代","v":"1980_1989"},{"n":"更早","v":"0_1979"}]},{"key":"by","name":"排序","value":[{"n":"综合","v":"1"},{"n":"最新","v":"2"},{"n":"最热","v":"3"},{"n":"评分","v":"4"}]}],
        "3": [
        {"key":"class","name":"类型","value":[{"n":"全部","v":""},{"n":"Netflix","v":"Netflix"},{"n":"动态漫画","v":"动态漫画"},{"n":"剧情","v":"剧情"},{"n":"动画","v":"动画"},{"n":"喜剧","v":"喜剧"},{"n":"冒险","v":"冒险"},{"n":"动作","v":"动作"},{"n":"奇幻","v":"奇幻"},{"n":"科幻","v":"科幻"},{"n":"儿童","v":"儿童"},{"n":"搞笑","v":"搞笑"},{"n":"爱情","v":"爱情"},{"n":"家庭","v":"家庭"},{"n":"短片","v":"短片"},{"n":"热血","v":"热血"},{"n":"益智","v":"益智"},{"n":"悬疑","v":"悬疑"},{"n":"经典","v":"经典"},{"n":"校园","v":"校园"},{"n":"Anime","v":"Anime"},{"n":"运动","v":"运动"},{"n":"亲子","v":"亲子"},{"n":"青春","v":"青春"},{"n":"恋爱","v":"恋爱"},{"n":"武侠","v":"武侠"},{"n":"惊悚","v":"惊悚"}]},{"key":"area","name":"地区","value":[{"n":"全部","v":""},{"n":"日本","v":"日本"},{"n":"大陆","v":"中国大陆"},{"n":"台湾","v":"中国台湾"},{"n":"美国","v":"美国"},{"n":"香港","v":"中国香港"},{"n":"韩国","v":"韩国"},{"n":"英国","v":"英国"},{"n":"法国","v":"法国"},{"n":"德国","v":"德国"},{"n":"印度","v":"印度"},{"n":"泰国","v":"泰国"},{"n":"丹麦","v":"丹麦"},{"n":"瑞典","v":"瑞典"},{"n":"巴西","v":"巴西"},{"n":"加拿大","v":"加拿大"},{"n":"俄罗斯","v":"俄罗斯"},{"n":"意大利","v":"意大利"},{"n":"比利时","v":"比利时"},{"n":"爱尔兰","v":"爱尔兰"},{"n":"西班牙","v":"西班牙"},{"n":"澳大利亚","v":"澳大利亚"},{"n":"其他","v":"其他"}]},{"key":"lang","name":"语言","value":[{"n":"全部","v":""},{"n":"国语","v":"国语"},{"n":"粤语","v":"粤语"},{"n":"英语","v":"英语"},{"n":"日语","v":"日语"},{"n":"韩语","v":"韩语"},{"n":"法语","v":"法语"},{"n":"其他","v":"其他"}]},{"key":"year","name":"年份","value":[{"n":"全部","v":""},{"n":"2025","v":"2025"},{"n":"2024","v":"2024"},{"n":"2023","v":"2023"},{"n":"2022","v":"2022"},{"n":"2021","v":"2021"},{"n":"2020","v":"2020"},{"n":"10年代","v":"2010_2019"},{"n":"00年代","v":"2000_2009"},{"n":"90年代","v":"1990_1999"},{"n":"80年代","v":"1980_1989"},{"n":"更早","v":"0_1979"}]},{"key":"by","name":"排序","value":[{"n":"综合","v":"1"},{"n":"最新","v":"2"},{"n":"最热","v":"3"},{"n":"评分","v":"4"}]}],
        "6": [{"key":"class","name":"类型","value":[{"n":"类型","v":""},{"n":"逆袭","v":"逆袭"},{"n":"甜宠","v":"甜宠"},{"n":"虐恋","v":"虐恋"},{"n":"穿越","v":"穿越"},{"n":"重生","v":"重生"},{"n":"剧情","v":"剧情"},{"n":"科幻","v":"科幻"},{"n":"武侠","v":"武侠"},{"n":"爱情","v":"爱情"},{"n":"动作","v":"动作"},{"n":"战争","v":"战争"},{"n":"冒险","v":"冒险"},{"n":"其它","v":"其它"}]},{"key":"year","name":"年份","value":[{"n":"全部","v":""},{"n":"2025","v":"2025"},{"n":"2024","v":"2024"},{"n":"2023","v":"2023"},{"n":"2022","v":"2022"},{"n":"2021","v":"2021"}]},{"key":"by","name":"排序","value":[{"n":"综合","v":"1"},{"n":"最新","v":"2"},{"n":"最热","v":"3"}]}]
    };
    return JSON.stringify({ 
        class: classes, 
        filters: filters 
    });
};

async function homeVod() {
    try {
        let homeUrl = `${HOST}/`;      
        let html = await request(homeUrl);
        if (!html) {throw new Error('推荐页请求失败');}
        let $ = load(html);
        let VODS = [];
        let klists = Array.from($('.module-item:not(:has(.h-item-title))'));
        klists.forEach((it) => {
            let $it = $(it);
            let kname = $it.find('.v-item-title:eq(1)').text()?.trim() || '';
            let kpic = kparam.img_host + $it.find('img').last().attr('data-original')?.trim() || '';
            let kid = $it.find('a').first().attr('href')?.trim() || '';
            VODS.push({
                vod_name: kname,
                vod_pic: kpic,
                vod_remarks: $it.find('span').last().text()?.trim() || '',
                vod_id: `${kid}@${kname}@${kpic}`
            });
        })
        return JSON.stringify({list: VODS});
    } catch (e) {
        console.error('获取推荐页失败：', error.message);
        return JSON.stringify({list: []});
    }
};

async function category(tid, pg, filter, extend) {
    try {
        let pgParse = parseInt(pg, 10);
        pg = pgParse < 1 || isNaN(pgParse) ? 1 : pgParse;
        let cateUrl = `${HOST}/show/${tid}-${extend?.class || ''}-${extend?.area || ''}-${extend?.lang || ''}-${extend?.year || ''}-${extend?.by || ''}-${pg}.html`;
        let html = await request(cateUrl);
        if (!html) {throw new Error('分类页请求失败');}
        let $ = load(html);
        let VODS = [];
        let klists = Array.from($('.module-item'));
        klists.forEach((it) => {
            let $it = $(it);
            let kname = $it.find('.v-item-title:eq(1)').text()?.trim() || '';
            let kpic = kparam.img_host + $it.find('img').last().attr('data-original')?.trim() || '';
            let kid = $it.find('a').first().attr('href')?.trim() || '';
            VODS.push({
                vod_name: kname,
                vod_pic: kpic,
                vod_remarks: $it.find('span').last().text()?.trim() || '',
                vod_id: `${kid}@${kname}@${kpic}`
            });
        })
        let pgCountParse = parseInt(kparam.pagecount, 10);
        let pagecount = pgCountParse < 1 || isNaN(pgCountParse) ? 999 : pgCountParse;
        return JSON.stringify({
            list: VODS,
            page: pg,
            pagecount: pagecount,
            limit: 30,
            total: 30*pagecount
        });
    } catch (e) {
        console.error('获取分类页失败：', error.message);
        return JSON.stringify({
            list: [],
            page: 1,
            pagecount: 0,
            limit: 30,
            total: 0
        });
    }
};

async function search(wd, quick, pg) {
    try {
        let pgParse = parseInt(pg, 10);
        pg = pgParse < 1 || isNaN(pgParse) ? 1 : pgParse;
        let searchUrl = `${HOST}/search?k=${wd}`;
        let html = await request(searchUrl);
        if (!html) {throw new Error('试搜索页请求失败');}
        let $ = load(html);
        let t = $('input').first().attr('value');
        searchUrl = `${searchUrl}&page=${pg}&t=${t}`;
        html = await request(searchUrl);
        if (!html) {throw new Error('搜索页请求失败');}
        $ = load(html);
        let VODS = [];
        let klists = Array.from($('.search-result-item'));
        klists.forEach((it) => {
            let $it = $(it);
            let kname = $it.find('img:eq(0)').attr('alt')?.trim() || '';
            let kpic = kparam.img_host + $it.find('img:eq(0)').attr('data-original')?.trim() || '';
            let kid = $it.attr('href')?.trim() || '';
            VODS.push({
                vod_name: kname,
                vod_pic: kpic,
                vod_remarks: $it.find('.search-result-item-header:eq(0)').text()?.trim() || '',
                vod_id: `${kid}@${kname}@${kpic}`
            });
        })
        return JSON.stringify({
            list: VODS,
            page: pg,
            pagecount: 10,
            limit: 30,
            total: 300
        });
    } catch (e) {
        console.error('获取搜索页失败：', error.message);
        return JSON.stringify({
            list: [],
            page: 1,
            pagecount: 0,
            limit: 30,
            total: 0
        });
    }
};

async function detail(id) {
    try {
        let [kid, kname, kpic] = id.split('@');
        let detailUrl = !/^http/.test(kid) ? `${HOST}${kid}` : kid;
        let html = await request(detailUrl);
        if (!html) {throw new Error('详情页请求失败');}
        let $ = load(html);
        let $intro = $('.detail-box').first();
        let udTabs = Array.from($('.source-item'));
        let ktabs = udTabs.map((it) => { return $(it).find('span').first().text()?.trim(); });
        let udUrls = Array.from($('.episode-list'));
        let kurls = udUrls.map((item) => {
            let kurl = Array.from($(item).find('a')).map((it) => { return $(it).text() + '$' + $(it).attr('href'); });
            return kurl.join('#');
        });
        ktabs = dealSameElements(ktabs);        
        if (kparam.tabsDeal) {     
            let [x = '', y = '', z = ''] = kparam.tabsDeal.split('@');
            let tab_remove = x.trim();
            let tab_order = (y.trim() ==='') ? [] : y.split('>');
            let tab_rename = {};
            let tRnArr = (z.trim() ==='') ? [] : z.split('&');
            if (tRnArr.length) {
                tRnArr.forEach(item => {
                  let [k, v] = item.split('>>');
                  tab_rename[k] = v;
                })
            }
            let ktus = ktabs.map((it, idx) => { return {"type_name": it, "type_value": kurls[idx]} });
            ktus = tabDeal(ktus, tab_remove, tab_order, tab_rename);
            ktabs = ktus.map(it => it.type_name);
            kurls = ktus.map(it => it.type_value);
        }
        let VOD = {
            vod_id: kid.match(/\d+/)?.[0] || 'id',
            vod_name: kname || '名称',
            vod_pic: kpic || '图片',
            vod_remarks: $intro.find('.detail-info-row-main:eq(-2)').text()?.trim() || '状态',
            vod_year: $intro.find('.detail-tags:eq(0) a:eq(0)').text()?.trim() || '0000',
            vod_area: $intro.find('.detail-tags:eq(0) a:eq(1)').text()?.trim() || '地区',
            type_name: $intro.find('.detail-tags:eq(0) a:eq(-1)').text()?.trim() || '类型',
            vod_lang: '' || '语言',
            vod_director: $intro.find('.detail-info-row-main:eq(0)').text()?.trim() || '导演',
            vod_actor: $intro.find('.detail-info-row-main:eq(1)').text()?.trim() || '主演',
            vod_content: $intro.find('.detail-desc:eq(0)').text()?.trim() || '简介',
            vod_play_from: ktabs.join('$$$'),
            vod_play_url: kurls.join('$$$')
        };
        return JSON.stringify({list: [VOD]});
    } catch (e) {
        console.error('获取详情页失败：', error.message);
        return JSON.stringify({list: []});
    }
};

async function play(flag, id, flags) {
    try {
        let jx = 0, kp = 0;
        if (cachedPlayUrls[id]) {return cachedPlayUrls[id];}
        let kurl = !/^http/.test(id) ? `${HOST}${id}` : id;
        const jurl = kurl;
        try {
            let html = await request(kurl);
            if (!html) {throw new Error('播放页请求失败');}
            if (/dujia/.test(html)) {
                let b64code = html.split("PPPP = '")[1].split("';")[0];
                const key = 'Isu7fOAvI6!&IKpAbVdhf&^F';
                kurl = decryptAesEcb(b64code, key);
            } else {
                kurl = html.split('src: "')[1].split('",')[0];
            }
        } catch (e) {
            console.error('跳转播放地址失败：', error.message);
            kurl = jurl;
        }
        if (!(/^http/.test(kurl)&&/\.(m3u8|mp4|mkv)/.test(kurl))) {
            kurl = jurl;
            kp = 1;
            jx = 1;
        }
        let playObj = { jx: jx, parse: kp, url: kurl, header: {...def_header, 'Referer': getHome(kurl)} };
        let playJson = JSON.stringify(playObj);
        if (playObj.parse === 0) {cachedPlayUrls[id] = playJson};
        return playJson;
    } catch (e) {
        console.error('播放失败：', error.message);
        return JSON.stringify({
            jx: 0,
            parse: 0,
            url: '', 
            header: {} 
        });
    }
};

function getHome(url) {
    if (!url || typeof url !== 'string') return '';
    const ourl = url;
    try {
        url = /%[0-9A-Fa-f]{2}/.test(url) ? decodeURIComponent(url) : url;
        let [proPart, rest = ''] = url.split('//');
        let domain = rest.split('/')[0] || '';
        url = (proPart + '//' + domain).trim();
        return url || ourl;
    } catch (e) {
        return ourl;
    }
};

function dealSameElements(arr) {
    try {
        if (!Array.isArray(arr)) {throw new Error('输入参数非数组');}
        let countObj = {};
        let newArr = [];
        arr.forEach((item) => {
            if (!countObj[item]) {
                countObj[item] = 1;
                newArr.push(item);
            } else {
                countObj[item]++;
                newArr.push(`${item}线${countObj[item]}`);
            }
        });
        return newArr;
    } catch (e) {
        return arr;
    }
};

function tabDeal(kArr, strRemove, arrOrder, objRename) {
    try {
        let dealed_arr = kArr;
        let nRemove = strRemove.replace(/^¥准:/, '');
        if (nRemove) {
            let filtered_arr;
            if (/^¥准:/.test(strRemove)) {
                let removeArr = nRemove.split(',');
                const removeSet = new Set(removeArr);
                filtered_arr = dealed_arr.filter(it => !removeSet.has(it.type_name));
            } else {
                let removeStr = strRemove.replace(/,/g, '|');
                let removeReg = new RegExp(removeStr);
                filtered_arr = dealed_arr.filter(it => !removeReg.test(it.type_name));
            }
            let removed_arr = filtered_arr.length ? filtered_arr : dealed_arr[0];
            dealed_arr = removed_arr;
        }
        if (Array.isArray(arrOrder) && arrOrder.length) {
            let ordered_arr = dealed_arr.sort((a, b) => {
                let idxA = arrOrder.indexOf(a.type_name);
                let idxB = arrOrder.indexOf(b.type_name);
                return (idxA === -1 ? 9999 : idxA) - (idxB === -1 ? 9999 : idxB);
            });
            dealed_arr = ordered_arr;
        }
        if (objRename && typeof objRename === "object" && Object.keys(objRename).length) {
            let renamed_arr = dealed_arr.map(it => { return { ...it, type_name: objRename[it.type_name] || it.type_name } });
            dealed_arr = renamed_arr;
        }
        return dealed_arr;
    } catch (e) {
        return kArr;
    }
};

async function request(reqUrl, header, data, method) {
    try {
        let optObj = {
            headers: header || kparam.headers,
            method: method?.toLowerCase() || 'get',
            data: (method === 'post') ? data : undefined,
            postType: (method === 'post') ? 'form' : undefined,
            timeout: 5000,
        };
        let res = await req(reqUrl, optObj);
        return res.content;
    } catch (e) {
        return '';
    }
};

function decryptAesEcb(data, key) {
    try {
        if (!data || typeof data !== 'string') {throw new Error('密文需为Base64字符串');}
        const cleanBase64 = data.replace(/^\uFEFF/, '').replace(/[^A-Za-z0-9+/=]/g, '');
        if ((cleanBase64.match(/=/g) || []).length > 2) {throw new Error('Base64填充错误');}
        key = key || kparam.key;
        if (!key || typeof key !== 'string') {throw new Error('密钥需传入或配置kparam.key');}
        const cleanKey = key.replace(/[\u0000-\u001F\u007F-\uFFFF]/g, '');
        if (!cleanKey) {throw new Error('密钥过滤后为空');}
        const keyWordArr = Crypto.enc.Utf8.parse(cleanKey);
        if (![16, 24, 32].includes(keyWordArr.sigBytes)) {throw new Error(`密钥需16/24/32字节，当前${keyWordArr.sigBytes}字节`);}
        const ciphertext = Crypto.enc.Base64.parse(cleanBase64);
        const decrypted = Crypto.AES.decrypt({ ciphertext }, keyWordArr, {
            mode: Crypto.mode.ECB,
            padding: Crypto.pad.Pkcs7,
            blockSize: 16
        });
        const plaintext = decrypted.toString(Crypto.enc.Utf8);
        if (!plaintext) throw new Error('解密结果为空');
        return plaintext;
    } catch (e) {
        console.error('AES-ECB解密失败：', e.message);
        return '';
    }
};

export function __jsEvalReturn() {
    return {
        init: init,
        home: home,
        homeVod: homeVod,
        category: category,
        search: search,
        detail: detail,
        play: play
    };
}