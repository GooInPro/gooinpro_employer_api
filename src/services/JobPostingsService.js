import models from "../models/index.js";
import mapService from "../services/mapService.js";

// 구인공고 등록
const registerJobPostingService = async (registerDTO) => {
    try {
        console.log("받은 DTO 데이터:", registerDTO);

        // 1. 주소를 위도/경도로 변환
        const coords = await mapService.getGeocode(registerDTO.wroadAddress);
        console.log("Geocode 응답:", coords); // 응답 구조 확인

        if (!coords.addresses || coords.addresses.length === 0) {
            throw new Error("주소에 대한 좌표를 찾을 수 없습니다.");
        }

        const location = coords.addresses[0];
        console.log("위치 정보:", location); // location 객체 확인

        // 2. WorkPlace 레코드 생성
        const newWorkPlace = await models.WorkPlace.create({
            eno: registerDTO.eno,
            wroadAddress: registerDTO.wroadAddress,
            wdetailAddress: registerDTO.wdetailAddress,
            wlati: location.y.toString(),
            wlong: location.x.toString(),
            wdelete: false
        });

        console.log("생성된 WorkPlace:", newWorkPlace);

        // 3. 구인공고 생성
        const newJobPosting = await models.JobPostings.create({
            eno: registerDTO.eno,
            wpno: newWorkPlace.wpno,
            jpname: registerDTO.jpname,
            jpcontent: registerDTO.jpcontent,
            jpvacancies: registerDTO.jpvacancies,
            jphourlyRate: registerDTO.jphourlyRate,
            jpworkDays: registerDTO.jpworkDays,
            jpminDuration: registerDTO.jpminDuration,
            jpmaxDuration: registerDTO.jpmaxDuration,
            jpworkStartTime: registerDTO.jpworkStartTime,
            jpworkEndTime: registerDTO.jpworkEndTime
        });

        return newJobPosting;
    } catch (error) {
        console.error("DTO 데이터:", registerDTO);
        console.error("구인공고 등록 서비스 실패:", error);
        throw new Error("구인공고 등록 중 오류 발생");
    }
};

// 구인공고 수정
const editJobPostingService = async (editDTO) => {
    try {
        // 1. 주소를 위도/경도로 변환
        const coords = await mapService.getGeocode(editDTO.wroadAddress);
        console.log("Geocode 응답:", coords); // 응답 구조 확인

        if (!coords.addresses || coords.addresses.length === 0) {
            throw new Error("주소에 대한 좌표를 찾을 수 없습니다.");
        }

        const location = coords.addresses[0];
        console.log("위치 정보:", location);

        // 2. WorkPlace 레코드 수정
        const updatedWorkPlace = await models.WorkPlace.update(
            {
                wroadAddress: editDTO.wroadAddress,
                wdetailAddress: editDTO.wdetailAddress,
                wlati: location.y.toString(),  // y가 위도
                wlong: location.x.toString(),  // x가 경도
                wdelete: false
            },
            { where: { wpno: editDTO.wpno } }
        );

        if (updatedWorkPlace[0] === 0) {
            throw new Error("수정할 WorkPlace를 찾을 수 없습니다.");
        }

        // 3. 구인공고 수정
        const updatedJobPosting = await models.JobPostings.update(
            {
                jpname: editDTO.jpname,
                jpcontent: editDTO.jpcontent,
                jpvacancies: editDTO.jpvacancies,
                jphourlyRate: editDTO.jphourlyRate,
                jpworkDays: editDTO.jpworkDays,
                jpminDuration: editDTO.jpminDuration,
                jpmaxDuration: editDTO.jpmaxDuration,
                jpworkStartTime: editDTO.jpworkStartTime,
                jpworkEndTime: editDTO.jpworkEndTime,
            },
            { where: { jpno: editDTO.jpno, eno: editDTO.eno } }
        );

        if (updatedJobPosting[0] === 0) {
            throw new Error("수정할 공고를 찾을 수 없습니다.");
        }

        return "구인공고가 성공적으로 수정되었습니다.";
    } catch (error) {
        console.error("구인공고 수정 서비스 실패:", error);
        throw new Error("구인공고 수정 중 오류 발생");
    }
};


// 구인공고 삭제
const deleteJobPostingService = async (jpno, eno) => {
    try {
        const deletedCount = await models.JobPostings.update(
            { jpdelete: true },
            { where: { jpno, eno } }
        );

        if (deletedCount[0] === 0) {
            throw new Error("삭제할 공고를 찾을 수 없습니다.");
        }

        return "구인공고가 성공적으로 삭제되었습니다.";
    } catch (error) {
        console.error("구인공고 삭제 서비스 실패:", error);
        throw new Error("구인공고 삭제 중 오류 발생");
    }
};

// 구인공고 단일 조회
const getOneJobPostingService = async (jpno, eno) => {
    try {
        const jobPosting = await models.JobPostings.findOne({
            where: { jpno, eno, jpdelete: false },
            include: [{
                model: models.WorkPlace,
                attributes: ['wroadAddress', 'wdetailAddress', 'wlati', 'wlong', 'wpno']
            }]
        });

        if (!jobPosting) {
            throw new Error("조회할 공고를 찾을 수 없습니다.");
        }

        // WorkPlace 정보를 포함하여 반환
        return {
            ...jobPosting.dataValues,
            wroadAddress: jobPosting.WorkPlace.wroadAddress,
            wdetailAddress: jobPosting.WorkPlace.wdetailAddress,
            wpno: jobPosting.WorkPlace.wpno,
            wlati: jobPosting.WorkPlace.wlati,
            wlong: jobPosting.WorkPlace.wlong
        };
    } catch (error) {
        console.error("구인공고 단일 조회 서비스 실패:", error);
        throw new Error("구인공고 단일 조회 중 오류가 발생했습니다.");
    }
};

// 구인공고 리스트 조회
const listJobPostingsService = async (eno) => {
    try {
        const jobPostings = await models.JobPostings.findAll({
            where: { eno, jpdelete: false },
            include: [{
                model: models.WorkPlace,
                attributes: ['wroadAddress', 'wdetailAddress']
            }],
            order: [["jpregdate", "DESC"]],
        });

        return jobPostings;
    } catch (error) {
        console.error("구인공고 리스트 조회 서비스 실패:", error);
        throw new Error("구인공고 리스트 조회 중 오류가 발생했습니다.");
    }
};

export {
    registerJobPostingService,
    editJobPostingService,
    deleteJobPostingService,
    getOneJobPostingService,
    listJobPostingsService
};
