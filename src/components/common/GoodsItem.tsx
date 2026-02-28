import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, CardMedia, IconButton, Snackbar } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUser, faClock, faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';

const API_BASE_URL = process.env.REACT_APP_API_URL;
interface GoodsItemProps {
    src: string;
    alt?: string;
    goodsName: string;
    bidPrice: number;
    buyOutPrice: number;
    peopleCount: number;
    auctionEndDate: string;
    onClick: () => void;
    like: boolean;
    onLike: () => void;
    onUnlike: () => void;
}

/** 상품 리스트에 들어가는 컴포넌트
 * 
 * @param src 이미지 URL
 * @param alt 대체 텍스트
 * @param goodsName 상품명
 * @param bidPrice 현재 입찰가
 * @param buyOutPrice 즉결가
 * @param peopleCount 입찰 참여 인원 수
 * @param auctionEndDate 경매 종료 날짜 및 시간
 * @param onClick 클릭 이벤트 함수
 * @param like 찜 여부
 * @param onLike 찜 했을 때 실행되는 함수 (ex: api 연결)
 * @param onUnlike 찜 해제 했을 때 실행되는 함수 (ex: api 연결)
 * @returns 
 */
const GoodsItem: React.FC<GoodsItemProps> = ({
    src,
    alt,
    goodsName,
    bidPrice,
    buyOutPrice,
    peopleCount,
    auctionEndDate,
    onClick,
    like,
    onLike,
    onUnlike
}) => {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');


    const handleHeartClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (like) { 
            onUnlike(); // onUnlike를 호출 (GoodsList에서 API 성공 시 상태 변경)
            // setSnackbarMsg(`${goodsName}을(를) 찜 해제했습니다.`);
            // setOpenSnackbar(true);
        } else { 
            onLike(); // onLike를 호출 (GoodsList에서 API 성공 시 상태 변경)
            // setSnackbarMsg(`${goodsName}을(를) 찜 했습니다.`);
            // setOpenSnackbar(true);
        }
    };

    const handleSnackbarClose = (
        event?: React.SyntheticEvent | Event,
        reason?: string
    ) => {
        if (reason === 'clickaway') return;
        setOpenSnackbar(false);
    };

    const action = (
        <React.Fragment>
            <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleSnackbarClose}
            >
                <FontAwesomeIcon icon={faTimes} fontSize="small" />
            </IconButton>
        </React.Fragment>
    );

    return (
        <>
            <Card sx={{ width: 160, height: 270, backgroundColor: 'inherit', border: 'none', boxShadow: 'none' }} onClick={onClick}>
                <Box sx={{ position: 'relative' }}>
                    <CardMedia
                        component="img"
                        height={160}
                        width={160}
                        image={src}
                        alt={alt}
                        sx={{
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'transform 0.1s ease, filter 0.1s ease',
                            '&:hover': {
                                filter: 'brightness(0.95)',
                            },
                            '&:active': {
                                filter: 'brightness(0.80)',
                            },
                            backgroundColor: 'grey'
                        }}
                    />
                    <FontAwesomeIcon
                        onClick={handleHeartClick}
                        icon={like ? faHeartSolid : faHeartRegular}                        
                        style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            width: 26,
                            height: 26,
                            transition: 'all 0.25s ease',
                            color: '#FF5050',
                            cursor: 'pointer',
                        }}
                    />
                </Box>

                <CardContent sx={{
                    padding: 0,
                    lineHeight: 2,
                    cursor: 'pointer',
                    transition: 'color 0.15s ease',
                    '&:hover *': {
                        opacity: 0.85,
                    },
                }}>
                    <Box sx={{
                        fontWeight: 500,
                        fontSize: 16,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                        width: '100%'
                    }}>{goodsName}</Box>

                    <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center' }}>
                        <Box sx={{ fontWeight: 500, fontSize: 12, color: '#676666' }}>현재가</Box>
                        <Box sx={{ fontWeight: 'bold', fontSize: 12, color: '#141414' }}>{bidPrice.toLocaleString()} 원</Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center' }}>
                        <Box sx={{ fontWeight: 500, fontSize: 12, color: '#676666' }}>즉결가</Box>
                        <Box sx={{ fontWeight: 'bold', fontSize: 12, color: '#DD8126' }}>{buyOutPrice.toLocaleString()} 원</Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center' }}>
                        <Box sx={{ fontWeight: 'bold', fontSize: 12, color: '#141414' }}>
                            <FontAwesomeIcon icon={faUser} style={{ width: 12, height: 12 }} /> {peopleCount}명
                        </Box>
                        <Box sx={{ fontWeight: 'bold', fontSize: 12, color: '#141414' }}>
                            <FontAwesomeIcon icon={faClock} style={{ width: 12, height: 12 }} /> {auctionEndDate}
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={2500}
                onClose={handleSnackbarClose}
                message={snackbarMsg}
                action={action}
            />
        </>
    );
}

export default GoodsItem;