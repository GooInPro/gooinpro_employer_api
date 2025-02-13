import express from 'express';
import models from '../models/index.js';
import axios from 'axios';
import mapService from '../services/mapService.js';

const router = express.Router();

// eno로 근무지 주소 조회
router.get('/workplace/:eno', async (req, res) => {
    try {
        const eno = req.params.eno;
        const workplace = await models.WorkPlace.findOne({
            where: { eno }
        });
        if (!workplace) {
            return res.status(404).json({ error: '근무지 정보를 찾을 수 없습니다.' });
        }
        return res.json(workplace);
    } catch (error) {
        console.error('근무지 조회 실패:', error);
        return res.status(500).json({ error: '근무지 조회 중 오류가 발생했습니다.' });
    }
});

// 모든 근무지 조회 엔드포인트
router.get('/workplaces', async (req, res) => {
    try {
        const workplaces = await models.WorkPlace.findAll({
            where: { wdelete: false },
            include: [{
                model: models.JobPostings,
                where: { jpdelete: false },
                required: false,
                attributes: ['jpname', 'jphourlyRate', 'jpregdate', 'jpenddate']
            }]
        });
        return res.json(workplaces);
    } catch (error) {
        console.error('근무지 전체 조회 실패:', error);
        return res.status(500).json({ error: '전체 근무지 조회 중 오류가 발생했습니다.' });
    }
});

// 주소를 좌표로 변환하는 프록시 엔드포인트
router.get('/geocode', async (req, res) => {
    try {
        const { query } = req.query;
        // 1. DB에서 해당 주소의 좌표 조회
        const existingLocation = await models.WorkPlace.findOne({
            where: {
                wroadAddress: query,
                wdelete: false
            }
        });

        // DB에 있으면 해당 좌표 반환
        if (existingLocation && existingLocation.wlati && existingLocation.wlong) {
            return res.json({
                addresses: [{
                    x: existingLocation.wlong,
                    y: existingLocation.wlati
                }]
            });
        }

        // 2. DB에 없는 경우 네이버 API 호출
        const response = await axios.get(
            'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode',
            {
                params: { query },
                headers: {
                    'X-NCP-APIGW-API-KEY-ID': process.env.NCP_CLIENT_ID,
                    'X-NCP-APIGW-API-KEY': process.env.NCP_CLIENT_SECRET,
                },
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Geocoding API 호출 실패:', error);
        res.status(500).json({ error: '주소 변환 중 오류가 발생했습니다.' });
    }
});

export default router;
