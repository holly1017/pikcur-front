import React, { useState, useEffect } from 'react';
import TitleLayout from '../../components/layout/TitleLayout';
import CustomInput from '../../components/common/CustomInput';
import CustomTextarea from '../../components/common/CustomTextarea';
import ImageUploadGroup from '../../components/common/ImageUploadGroup';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { api } from '../../common/api';
import { useNavigate } from 'react-router-dom';

interface ImageState {
    file: File;
    previewUrl: string;
}

// 백엔드에서 받아올 카테고리 데이터 구조 정의
interface Category {
    categoryId: number;
    categoryName: string;
    subCategories: { categoryId: number; categoryName: string }[];
}

interface Brand {
    brandId: number;
    brandName: string;
}

// 브랜드 목록 (이것은 로컬 데이터를 유지합니다)
const brandList = ['나이키', '아디다스', '구찌', '샤넬', '루이비통', '스톤아일랜드', '꼼데가르송', '우영미', '기타'];

// 사이즈 데이터 (이것은 로컬 데이터를 유지합니다)
const sizeData: { [key: string]: string[] } = {
    '아우터': ['XS', 'S', 'M', 'L', 'XL', 'XXL', '90', '95', '100', '105', '110', 'FREE'],
    '상의': ['XS', 'S', 'M', 'L', 'XL', 'XXL', '90', '95', '100', '105', '110', 'FREE'],
    '바지': ['24', '25', '26', '27', '28', '29', '30', '31', '32', 'S', 'M', 'L', 'FREE'],
    '원피스 / 스커트': ['XS', 'S', 'M', 'L', 'FREE'],
    '신발': ['220', '225', '230', '235', '240', '245', '250', '255', '260', '265', '270', '275', '280'],
    '가방': ['FREE', 'One Size'],
    '모자': ['FREE', 'One Size'],
    '악세사리': ['FREE', 'One Size'],
    '주얼리': ['FREE', 'One Size'],
};

const GoodsForm: React.FC = () => {
    // 상품 관련 상태
    const [images, setImages] = useState<ImageState[]>([]);
    const [selectedStatus, setSelectedStatus] = useState('새상품');
    const [selectedGender, setSelectedGender] = useState('M');
    const [goodsName, setGoodsName] = useState('');
    const [goodsInfo, setGoodsInfo] = useState('');
    const [buyoutPrice, setBuyoutPrice] = useState('');
    const [startPrice, setStartPrice] = useState('');
    const [shippingFee, setShippingFee] = useState('');
    const [auctionEndDate, setAuctionEndDate] = useState('');

    // 카테고리 관련 상태
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<number | ''>('');
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | ''>('');
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]); // 현재 선택된 사이즈들

    const [brandList, setBrandList] = useState<Brand[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        api.get("/goods/categories")
            .then(res => {
                setCategories(res);
                setSelectedMainCategoryId('');
                setSelectedSubCategoryId('');
                setSelectedSizes([]);
            })
            .catch(err => console.error("카테고리 불러오기 실패", err));
        api.get("/brand/list")
            .then(res => setBrandList(res))
    }, []);
    // 헬퍼: 현재 대분류 카테고리 객체 찾기
    const selectedMainCategory = categories.find(c => c.categoryId === selectedMainCategoryId);

    // 계산된 상태: 선택 가능한 사이즈 목록 (대분류에 따라 달라짐)
    const availableSizes = selectedMainCategory
        ? sizeData[selectedMainCategory.categoryName] || []
        : [];

    // 이벤트 핸들러: 상품 상태 변경
    const handleChangeStatus = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedStatus(event.target.value);
    };

    // 이벤트 핸들러: 성별 변경
    const handleChangeGender = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedGender(event.target.value);
    };

    // ⭐️ 이벤트 핸들러: 대분류 카테고리 변경
    // ⭐️ 수정된 이벤트 핸들러: 대분류 카테고리 변경
    const handleMainCategoryChange = (event: SelectChangeEvent) => {
        const id = Number(event.target.value);
        setSelectedMainCategoryId(id);
        setSelectedSubCategoryId(''); // 대분류 변경 시 소분류 초기화

        // ✅ 해결: 대분류가 바뀌면, 기존에 선택했던 사이즈를 무조건 비워줍니다.
        // 사용자가 새로운 카테고리에 맞는 사이즈를 직접 선택하도록 유도합니다.
        setSelectedSizes([]);

        // 이 외의 불필요한 setSelectedSizes 로직은 모두 제거합니다.
    };

    // 이벤트 핸들러: 소분류 카테고리 변경
    const handleSubCategoryChange = (event: SelectChangeEvent) => {
        setSelectedSubCategoryId(Number(event.target.value));
    };

    // 이벤트 핸들러: 숫자 입력 처리
    const handleNumericChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const { value } = event.target;
            // 빈 문자열이거나, 숫자만 포함하는 경우에만 허용
            if (value === '' || /^[0-9\b]+$/.test(value)) {
                setter(value);
            }
        };

    // 등록 버튼 핸들러
    const handleRegister = () => {
        // 유효성 검사 로직 (생략)

        const formData = new FormData();

        // 최종 카테고리 ID (소분류가 있으면 소분류 ID, 없으면 대분류 ID)

        const goodsData = {
            goodsName,
            goodsInfo,
            quality: selectedStatus,
            gender: selectedGender,
            categoryId: Number(selectedSubCategoryId),
            brandId: selectedBrand?.brandId,
            size: selectedSizes.join(","),
            buyoutPrice,
            startPrice,
            shippingPrice: shippingFee,
            auctionEndDate
        };

        // 상품 데이터 JSON을 Blob으로 변환하여 FormData에 추가
        formData.append("goodsData", new Blob([JSON.stringify(goodsData)], { type: "application/json" }));

        // 이미지 파일들 추가
        const files = images.map(img => img.file);
        console.log(files);
        api.form.post("/goods", { goodsData }, files)
            .then(res => {
                alert("상품 등록 성공");
                navigate('/');
            })
            .catch(err => {
                console.error("상품 등록 실패", err);
                // 실패 시 처리 로직
            });
    };


    return (
        <TitleLayout
            title="상품 등록"
            subTitle="경매에 낼 상품 정보를 자세히 작성해 주세요."
            content={
                <div>
                    <div style={{ fontSize: 18, fontWeight: 'normal', color: '#141414', display: 'flex', flexDirection: 'column', marginTop: '27px', gap: '11px' }}>
                        <div>상품명</div>
                        <CustomInput
                            fontSize={18}
                            width={448}
                            height={56}
                            placeholder="상품명을 입력해주세요."
                            value={goodsName}
                            onChange={(e) => setGoodsName(e.target.value)}
                        />
                    </div>

                    <div style={{ fontSize: 18, fontWeight: 'normal', color: '#141414', display: 'flex', flexDirection: 'column', marginTop: '27px', gap: '11px' }}>
                        <div>카테고리</div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <FormControl sx={{ minWidth: 219 }}>
                                <InputLabel id="main-category-label">대분류</InputLabel>
                                <Select
                                    labelId="main-category-label"
                                    value={selectedMainCategoryId === '' ? '' : selectedMainCategoryId.toString()}
                                    label="대분류"
                                    onChange={handleMainCategoryChange}
                                    sx={{ height: 56 }}
                                >
                                    {categories.map(cat => (
                                        <MenuItem key={cat.categoryId} value={cat.categoryId.toString()}>
                                            {cat.categoryName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl sx={{ minWidth: 219 }}>
                                <InputLabel id="sub-category-label">소분류</InputLabel>
                                <Select
                                    labelId="sub-category-label"
                                    value={selectedSubCategoryId === '' ? '' : selectedSubCategoryId.toString()}
                                    label="소분류"
                                    onChange={handleSubCategoryChange}
                                    disabled={!selectedMainCategoryId || (selectedMainCategory?.subCategories.length ?? 0) === 0}
                                    sx={{ height: 56 }}
                                >
                                    {selectedMainCategory?.subCategories.map(sub => (
                                        <MenuItem key={sub.categoryId} value={sub.categoryId.toString()}>
                                            {sub.categoryName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                    </div>

                    <div style={{ fontSize: 18, fontWeight: 'normal', color: '#141414', display: 'flex', flexDirection: 'column', marginTop: '27px', gap: '11px' }}>
                        <div>상품 상태</div>
                        <RadioGroup row value={selectedStatus} onChange={handleChangeStatus}>
                            <FormControlLabel value="새상품" control={<Radio />} label="새상품" />
                            <FormControlLabel value="사용감 없음" control={<Radio />} label="사용감 없음" />
                            <FormControlLabel value="사용감 있음" control={<Radio />} label="사용감 있음" />
                            <FormControlLabel value="사용감 많음" control={<Radio />} label="사용감 많음" />
                        </RadioGroup>
                    </div>

                    <div style={{ fontSize: 18, fontWeight: 'normal', color: '#141414', display: 'flex', flexDirection: 'column', marginTop: '27px', gap: '11px' }}>
                        <div>브랜드</div>
                        <Autocomplete
                            options={brandList}
                            getOptionLabel={(option) => option.brandName} // 화면에는 이름 표시
                            value={selectedBrand}
                            onChange={(event, newValue) => setSelectedBrand(newValue)}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="브랜드를 검색하여 입력하세요." />
                            )}
                            sx={{ width: 448 }}
                        />
                    </div>

                    <div style={{ fontSize: 18, fontWeight: 'normal', color: '#141414', display: 'flex', flexDirection: 'column', marginTop: '27px', gap: '11px' }}>
                        <div>성별</div>
                        <RadioGroup row value={selectedGender} onChange={handleChangeGender}>
                            <FormControlLabel value="M" control={<Radio />} label="남성" />
                            <FormControlLabel value="F" control={<Radio />} label="여성" />
                        </RadioGroup>
                    </div>

                    <div style={{ fontSize: 18, fontWeight: 'normal', color: '#141414', display: 'flex', flexDirection: 'column', marginTop: '27px', gap: '11px' }}>
                        <div>사이즈</div>
                        <Autocomplete
                            multiple
                            freeSolo
                            options={availableSizes} // 선택 가능한 사이즈 목록
                            value={selectedSizes} // 현재 선택된 사이즈
                            onChange={(event, newValue) => setSelectedSizes(newValue)}
                            renderInput={(params) => <TextField {...params} placeholder="사이즈 선택" />}
                            sx={{ width: 448 }}
                            disabled={!selectedMainCategoryId || availableSizes.length === 0} // 대분류 미선택 또는 사이즈 목록이 없는 경우 비활성화
                        />
                    </div>

                    <div style={{ fontSize: 18, fontWeight: 'normal', color: '#141414', display: 'flex', flexDirection: 'column', marginTop: '27px', gap: '11px' }}>
                        <div>상품 설명</div>
                        <CustomTextarea
                            fontSize={18}
                            width={1039}
                            height={240}
                            placeholder="상품 설명을 입력해주세요."
                            value={goodsInfo}
                            onChange={(e) => setGoodsInfo(e.target.value)}
                        />
                    </div>

                    <div style={{ fontSize: 18, fontWeight: 'normal', color: '#141414', display: 'flex', flexDirection: 'column', marginTop: '27px', gap: '11px' }}>
                        이미지 등록 (최대 10장)
                        <ImageUploadGroup maxCount={10} images={images} setImages={setImages} />
                    </div>

                    <div style={{ fontSize: 18, fontWeight: 'normal', color: '#141414', display: 'flex', flexDirection: 'column', marginTop: '27px', gap: '11px' }}>
                        즉결 가격
                        <CustomInput
                            width={448}
                            height={56}
                            placeholder={"즉결 가격을 입력해주세요."}
                            fontSize={18}
                            value={buyoutPrice}
                            onChange={handleNumericChange(setBuyoutPrice)}
                            type="tel"
                        />
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 'normal', color: '#141414', display: 'flex', flexDirection: 'column', marginTop: '27px', gap: '11px' }}>
                        경매 시작 가격
                        <CustomInput
                            width={448}
                            height={56}
                            placeholder={"경매 시작 가격을 입력해주세요."}
                            fontSize={18}
                            value={startPrice}
                            onChange={handleNumericChange(setStartPrice)}
                            type="tel"
                        />
                    </div>

                    {/* --- (2. 레이아웃 수정 및 value, onChange 연결) --- */}
                    <div style={{ fontSize: 18, fontWeight: 'normal', color: '#141414', display: 'flex', flexDirection: 'column', marginTop: '27px', gap: '11px' }}>
                        경매 종료일
                        <CustomInput
                            width={448}
                            height={56}
                            placeholder={"경매 종료일을 선택해주세요."}
                            fontSize={18}
                            type="datetime-local"
                            value={auctionEndDate}
                            onChange={(e) => setAuctionEndDate(e.target.value)}
                        />
                    </div>

                    <div style={{ fontSize: 18, fontWeight: 'normal', color: '#141414', display: 'flex', flexDirection: 'column', marginTop: '27px', gap: '11px' }}>
                        배송비
                        <CustomInput
                            width={448}
                            height={56}
                            placeholder={"배송비를 입력해주세요."}
                            fontSize={18}
                            value={shippingFee}
                            onChange={handleNumericChange(setShippingFee)}
                            type="tel"
                        />
                    </div>
                </div>
            }
            leftButtonName="등록하기"
            rightButtonName="취소"
            leftButtonClickHandler={handleRegister}
            rightButtonClickHandler={() => console.log("취소")}
        />
    );
};

export default GoodsForm;