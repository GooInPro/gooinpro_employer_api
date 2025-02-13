import {sequelize} from "../config/MariaDB.js";
import {DataTypes} from "sequelize";

//근무지 주소
const WorkPlace = sequelize.define('WorkPlace', {
    wpno: {  //Primary Key
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    eno: {  // Foreign Key - 관계는 index.js에서 설정
        type: DataTypes.BIGINT,
        allowNull: false
    },
    wroadAddress: { //도로명 주소
        type: DataTypes.STRING,
        allowNull: false
    },
    wdetailAddress: {   //상세 주소
        type: DataTypes.STRING,
        allowNull: true
    },
    wlati: {  // 위도 추가
        type: DataTypes.STRING,
        allowNull: true
    },
    wlong: {  // 경도 추가
        type: DataTypes.STRING,
        allowNull: true
    },
    wdelete: {  // 삭제 여부 추가
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'tbl_workPlace',
    timestamps: false
});

export default WorkPlace;
