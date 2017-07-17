import * as Module from '../src/module'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised).should()

describe("Module", function(){
	context('#extractListenings', () => {
		it('should be able to extract all listenings pins', () => {
			const transportConfig = {
				listenings: [
					{
						type: 'http',
						pins: [
							{role: 'role_1', cmd: '*'},
							{role: 'role_2', cmd: 'a'}
						]
					},
					{
						type: 'http',
						pins: [
							{role: 'role_3', cmd: '*'}
						]
					}
				]
			}
			Module.extractListenings(transportConfig).should.be.deep.equal([
					{role: 'role_1', cmd: '*'},
					{role: 'role_2', cmd: 'a'},
					{role: 'role_3', cmd: '*'}
				])
		})
		it('should ignore undefined pin and empty pin set', () => {
			const transportConfig = {
				listenings: [
					{
						type: 'http',
					},
					{
						type: 'http',
						pins: [
							{role: 'role_3', cmd: '*'}
						]
					},
					{
						type: 'haha',
						pins: []
					}
				]
			}
			Module.extractListenings(transportConfig).should.be.deep.equal([
					{role: 'role_3', cmd: '*'}
				])
		})
	})
})