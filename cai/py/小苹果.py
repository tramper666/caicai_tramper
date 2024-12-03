"""

作者 凯悦宾馆 🚓 内容均从互联网收集而来 仅供交流学习使用 版权归原创者所有 如侵犯了您的权益 请通知作者 将及时删除侵权内容
                    ====================kaiyuebinguan====================

"""

import requests
from bs4 import BeautifulSoup
import re
from base.spider import Spider
import sys
import json
import base64
import urllib.parse

sys.path.append('..')

xurl = "http://item.xpgtv.xyz"

headerx = {
    'User-Agent': 'okhttp/3.12.11',
    'version': 'XPGBOX com.phoenix.tv1.3.3',
    'token': 'dlsrzQiVkxgxYnpvfhTfMJlsPK3Y9zlHl+hovVfGeMNNEkwoyDQr1YEuhaAKbhz0SmxUfIXFGORrWeQrfDJQZtBxGWY/wnqwKk1McYhZES5fuT4ODVB13Cag1mDiMRIi8JQuZCJxQLfu8EEFUShX8dXKMHAT5jWTrDSQTJXwCDT2KRB4TUA7QF0pZbpvQPLVVzXf',
    'user_id': 'XPGBOX',
    'token2': 'XFxIummRrngadHB4TCzeUaleebTX10Vl/ftCvGLPeI5tN2Y/liZ5tY5e4t8=',
    'hash': 'c56f',
    'timestamp': '1727236846'
}

pm = ''

class Spider(Spider):
    global xurl
    global headerx

    def getName(self):
        return "首页"

    def init(self, extend):
        pass

    def isVideoFormat(self, url):
        pass

    def manualVideoCheck(self):
        pass

    def extract_middle_text(self, text, start_str, end_str, pl, start_index1: str = '', end_index2: str = ''):
        if pl == 3:
            plx = []
            while True:
                start_index = text.find(start_str)
                if start_index == -1:
                    break
                end_index = text.find(end_str, start_index + len(start_str))
                if end_index == -1:
                    break
                middle_text = text[start_index + len(start_str):end_index]
                plx.append(middle_text)
                text = text.replace(start_str + middle_text + end_str, '')
            if len(plx) > 0:
                purl = ''
                for i in range(len(plx)):
                    matches = re.findall(start_index1, plx[i])
                    output = ""
                    for match in matches:
                        match3 = re.search(r'(?:^|[^0-9])(\d+)(?:[^0-9]|$)', match[1])
                        if match3:
                            number = match3.group(1)
                        else:
                            number = 0
                        if 'http' not in match[0]:
                            output += f"#{'📽️丢丢👉' + match[1]}${number}{xurl}{match[0]}"
                        else:
                            output += f"#{'📽️丢丢👉' + match[1]}${number}{match[0]}"
                    output = output[1:]
                    purl = purl + output + "$$$"
                purl = purl[:-3]
                return purl
            else:
                return ""
        else:
            start_index = text.find(start_str)
            if start_index == -1:
                return ""
            end_index = text.find(end_str, start_index + len(start_str))
            if end_index == -1:
                return ""

        if pl == 0:
            middle_text = text[start_index + len(start_str):end_index]
            return middle_text.replace("\\", "")

        if pl == 1:
            middle_text = text[start_index + len(start_str):end_index]
            matches = re.findall(start_index1, middle_text)
            if matches:
                jg = ' '.join(matches)
                return jg

        if pl == 2:
            middle_text = text[start_index + len(start_str):end_index]
            matches = re.findall(start_index1, middle_text)
            if matches:
                new_list = [f'✨丢丢👉{item}' for item in matches]
                jg = '$$$'.join(new_list)
                return jg

    def homeContent(self, filter):
        result = {}
        result['class'] = []
        j=['丢丢电影','丢丢剧集','丢丢综艺','丢丢动漫']
        for i in range(0, len(j)):
            result['class'].append({'type_id': str(i), 'type_name': j[i]})
        return result


        # cateManual = {
        #     "电影": "1",
        #     "剧集": "2",
        #     "综艺": "3",
        #     "动漫": "4"
        # }
        # classes = []
        # for k in cateManual:
        #     classes.append({
        #         'type_name': k,
        #         'type_id': cateManual[k]
        #     })
        # result['class'] = classes
        # # if (filter):
        # #     result['filters'] = self.config['filter']


    def homeVideoContent(self):
        videos = []

        detail = requests.get(url=xurl+'/api.php/v2.main/androidhome', headers=headerx)
        detail.encoding = "utf-8"

        if detail.status_code == 200:
            js1 = detail.json()
            for i in js1['data']['list']:
                remark=i['title']


                for j in i['list']:
                    name = j['name']

                    id = j['id']

                    pic = j['pic']


                    video = {
                        "vod_id": id,
                        "vod_name": '丢丢📽️' + name,
                        "vod_pic": pic,
                        "vod_remarks": '丢丢▶️' + remark
                    }
                    videos.append(video)

        result = {'list': videos}
        return result


    def categoryContent(self, cid, pg, filter, ext):
        result = {}
        if pg:
            page = int(pg)
        else:
            page = 1
        page = int(pg)
        videos = []

        if '年代' in ext.keys():
            NdType = ext['年代']
        else:
            NdType = ''

        if page == '1':
            url = f'{xurl}/api.php/v2.vod/androidfilter10086?page={str(page)}&type={cid}'


        else:
            url = f'{xurl}/api.php/v2.vod/androidfilter10086?page={str(page)}&type={cid}'


        try:
            detail = requests.get(url=url, headers=headerx)
            detail.encoding = "utf-8"
            if detail.status_code == 200:
                data = detail.json()

                for vod in data['data']:
                    name = vod['name']

                    id = vod['id']

                    pic = vod['pic']

                    remark = vod['area']

                    video = {
                        "vod_id": id,
                        "vod_name": '丢丢📽️' + name,
                        "vod_pic": pic,
                        "vod_remarks": '丢丢▶️' + remark
                    }
                    videos.append(video)

        except:
            pass
        result = {'list': videos}
        result['page'] = pg
        result['pagecount'] = 9999
        result['limit'] = 90
        result['total'] = 999999
        return result

    def detailContent(self, ids):
        _id = ids[0]
        url = f'{xurl}/api.php/v3.vod/androiddetail2?vod_id={_id}'
        rsp = requests.get(url, headers=headerx)
        js1=json.loads(rsp.text)
        root = js1['data']
        node = root['urls']
        d = [it['key'] + "$" + f"http://c.xpgtv.net/m3u8/{it['url']}.m3u8" for it in node]
        vod = {
            "vod_name": root['name'],
            'vod_play_from': '小苹果',
            'vod_play_url': '#'.join(d),
        }
        result = {
            'list': [
                vod
            ]
        }
        return result

    def playerContent(self, flag, id, vipFlags): 
        result = {}
        result["parse"] = 0
        result["url"] = id
        result["header"] = headerx
        return result



    def searchContentPage(self, key, quick, page):  
        url = f'{xurl}/api.php/v2.vod/androidsearch10086?page={page}&wd={key}'
        res=requests.get(url,headers=headerx)
        js1 = json.loads(res.text)
        root = js1['data']
        videos = []
        for vod in root:
            videos.append({
                "vod_id": vod['id'],
                "vod_name": vod['name'],
                "vod_pic": vod['pic'],
                "vod_remarks": vod['score']
            })
        result = {
            'list': videos
        }
        return result

    def searchContent(self, key, quick):
        return self.searchContentPage(key, quick, '1')

    def localProxy(self, params):
        if params['type'] == "m3u8":
            return self.proxyM3u8(params)
        elif params['type'] == "media":
            return self.proxyMedia(params)
        elif params['type'] == "ts":
            return self.proxyTs(params)
        return None



