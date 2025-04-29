const app = require('express');
const router = app.Router();
const payallService = require('../services/payallService');

router.get('/getSaldo', async (req, res)=>{
    try {
        const saldo = await payallService.saldoCuenta();
        if (!saldo) {
            return res.status(400).json({ message: 'Error getting saldo' });
        }
        res.status(200).json({ saldo });
        
    } catch (error) {
        console.error('Error getting saldo:', error.message);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });     
    }
});

router.get('/echoTest', async(req, res)=>{
    try{
        const response = await payallService.echoTest();
        if (!response) {
            return res.status(400).json({ message: 'Error in echoTest' });
        }
        res.status(200).json({ response });

    } catch (error) {
        console.error('Error in echoTest:', error.message);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

router.post('/consultaNetuno', async (req, res) => {
    try {
        const { nacionalidad, documento } = req.body;
        if (!nacionalidad || !documento) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const response = await payallService.consultaNetuno(nacionalidad, documento);
        if (!response) {
            return res.status(400).json({ message: 'Error in consultaNetuno' });
        }
        res.status(200).json({ response });
        
    } catch (error) {
        console.error('Error in consultaNetuno:', error.message);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

router.post('/consultaSaldoCantv', async (req, res) => {
    try {
        const { operadora, producto, numero_contrato } = req.body;
        if (!operadora || !producto || !numero_contrato) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const response = await payallService.saldoCantv(operadora, producto, numero_contrato);
        if (!response) {
            return res.status(400).json({ message: 'Error in consultaSaldoCantv' });
        }
        res.status(200).json({ response });
        
    } catch (error) {
        console.error('Error in consultaSaldoCantv:', error.message);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

router.post('/consultaSaldoInter', async (req, res) => {
    try {
        const { operadora, producto, cedula } = req.body;
        if (!operadora || !producto || !cedula) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const response = await payallService.saldoInter(operadora, producto, cedula);
        if (!response) {
            return res.status(400).json({ message: 'Error in consultaSaldoInter' });
        }
        res.status(200).json({ response });
        
    } catch (error) {
        console.error('Error in consultaSaldoInter:', error.message);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

router.post('/consultaSaldoSimpletv', async (req, res) => {
    try {
        const { operadora, producto, smartcardnumber } = req.body;
        if (!operadora || !producto || !smartcardnumber) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const response = await payallService.balanceSimpletv(operadora, producto, smartcardnumber);
        if (!response) {
            return res.status(400).json({ message: 'Error in consultaSaldoSimpletv' });
        }
        res.status(200).json({ response });
        
    } catch (error) {
        console.error('Error in consultaSaldoSimpletv:', error.message);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
);

router.post('/consultaSaldoDigitel', async (req, res) => {
    try {
        const { operadora, producto, numero_contrato } = req.body;
        if (!operadora || !producto || !numero_contrato) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const response = await payallService.saldoDigitel(operadora, producto, numero_contrato);
        if (!response) {
            return res.status(400).json({ message: 'Error in consultaSaldoDigitel' });
        }
        res.status(200).json({ response });
        
    } catch (error) {
        console.error('Error in consultaSaldoDigitel:', error.message);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

router.post('/consultaSaldoMovistar', async (req, res) => {
    try {
        const { operadora, producto, numero_contrato } = req.body;
        if (!operadora || !producto || !numero_contrato) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const response = await payallService.saldoMovistar(operadora, producto, numero_contrato);
        if (!response) {
            return res.status(400).json({ message: 'Error in consultaSaldoMovistar' });
        }
        res.status(200).json({ response });
        
    } catch (error) {
        console.error('Error in consultaSaldoMovistar:', error.message);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

router.post('/consultaSaldoMovilnet', async (req, res) => {
    try {
        const { operadora, producto, numero_contrato } = req.body;
        if (!operadora || !producto || !numero_contrato) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const response = await payallService.consultaSaldoMovilnet(operadora, producto);
        if (!response) {
            return res.status(400).json({ message: 'Error in consultaSaldoMovilnet' });
        }
        res.status(200).json({ response });
        
    } catch (error) {
        console.error('Error in consultaSaldoMovilnet:', error.message);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

router.post('/getTasa', async (req, res) => {
    try {
        const { operadora, producto, monto } = req.body;
        if (!operadora || !producto || !monto) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const response = await payallService.consultaTasa(operadora, producto, monto);
        if (!response) {
            return res.status(400).json({ message: 'Error in getTasa' });
        }
        res.status(200).json({ response });
        
    } catch (error) {
        console.error('Error in getTasa:', error.message);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

module.exports = router;