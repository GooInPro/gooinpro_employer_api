import axios from 'axios';
import models from '../models/index.js';

const mapService = {
    getGeocode: async (address) => {
        try {
            // 1. DB에서 해당 주소의 좌표 조회
            const existingLocation = await models.WorkPlace.findOne({
                where: {
                    wroadAddress: address,
                    wdelete: false
                }
            });

            // DB에 있으면 네이버 API 응답 형식과 동일하게 반환
            if (existingLocation && existingLocation.wlati && existingLocation.wlong) {
                return {
                    addresses: [{
                        x: existingLocation.wlong,
                        y: existingLocation.wlati
                    }]
                };
            }

            // 2. 주소 전처리 ("지하" 제거) -> Kakao 우편번호 서비스 호환성 위해 사용
            const formattedAddress = address.replace('지하 ', '');

            // 3. DB에 없는 경우 네이버 API 호출
            console.log("네이버 API 호출 주소:", formattedAddress);
            const response = await axios.get('https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode', {
                headers: {
                    'X-NCP-APIGW-API-KEY-ID': process.env.NCP_CLIENT_ID,
                    'X-NCP-APIGW-API-KEY': process.env.NCP_CLIENT_SECRET,
                    'Accept': 'application/json'
                },
                params: {
                    query: formattedAddress
                }
            });

            console.log("네이버 API 응답:", response.data);

            // 4. 응답 검증
            if (!response.data.addresses || response.data.addresses.length === 0) {
                throw new Error('주소에 대한 좌표를 찾을 수 없습니다.');
            }

            return response.data;
        } catch (error) {
            console.error("Geocoding API 에러:", error);
            throw new Error('Geocoding 실패: ' + error.message);
        }
    },

    getReverseGeocode: async (coords) => {
        try {
            const response = await axios.get('https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc', {
                headers: {
                    'X-NCP-APIGW-API-KEY-ID': process.env.NCP_CLIENT_ID,
                    'X-NCP-APIGW-API-KEY': process.env.NCP_CLIENT_SECRET,
                    'Accept': 'application/json'
                },
                params: {
                    coords: coords,
                    output: 'json'
                }
            });
            return response.data;
        } catch (error) {
            throw new Error('Reverse Geocoding 실패: ' + error.message);
        }
    }
};

export default mapService;
